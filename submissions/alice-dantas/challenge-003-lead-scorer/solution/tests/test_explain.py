import re

import pytest

from leadscorer import data, policy, triage, views
from leadscorer.__main__ import main, render_detail, render_list
from leadscorer.fmt import fmt_int

NUMBER = re.compile(r"\d{2}/\d{2}/\d{4}|\d{1,3}(?:\.\d{3})+|\d+")
BAND_WORD = re.compile(r"\b(alt[oa]|médi[oa]|baix[oa])\b", re.IGNORECASE)
BASE_RATE_START = "Não sabemos a chance de fechar"


def context(dataset):
    return triage.resolve_context(dataset.opportunities)


def detail(dataset, opportunity_id):
    return views.opportunity_detail(dataset, opportunity_id)["item"]


def texts(item):
    return [sentence["text"] for sentence in item["explanation"]]


def all_items(dataset):
    sellers = sorted(dataset.opportunities["sales_agent"].unique())
    payloads = [views.seller_pipeline(dataset, seller) for seller in sellers]
    return payloads, [entry for p in payloads for g in p["groups"] for entry in g["items"]]


def assert_verifiable(entry, meta):  # AC-3.7
    for sentence in entry["explanation"]:
        assert sentence["fields"], sentence
        allowed, text = set(), sentence["text"]
        for value in sentence["fields"].values():
            if isinstance(value, int):
                allowed |= {str(value), fmt_int(value)}
            elif isinstance(value, str):
                text = text.replace(value, " ")  # números dentro de um campo de texto (ex.: "GTK 500")
        for number in NUMBER.findall(text):
            assert number in allowed, (number, sentence)
    by_factor = {s["factor"]: s["fields"] for s in entry["explanation"]}
    if entry["state"] in (policy.FOCAR, policy.REVISAR):
        assert by_factor["position"]["age_days"] == entry["age_days"]
        assert by_factor["position"]["cycle_limit_days"] == meta["cycle_limit_days"]
    assert by_factor["table_value"]["sales_price"] == entry["sales_price"]
    if "p90_days" in by_factor["cycle"]:
        ref = meta["cycle_references"][entry["product"]]
        assert (by_factor["cycle"]["p90_days"], by_factor["cycle"]["won_n"]) == (ref["p90_days"], ref["won_n"])
    rate = meta["base_rate"]
    assert by_factor["base_rate"] == {"base_rate_pct": rate["pct"], "range_low_pct": rate["low_pct"],
                                      "range_high_pct": rate["high_pct"]}


def assert_vocabulary(text):  # AC-3.8
    lowered = text.lower()
    for term in policy.FORBIDDEN_TERMS:
        assert term not in lowered, (term, text)
    for match in BAND_WORD.finditer(text):
        assert lowered[:match.start()].endswith("de tabela "), (match.group(), text)


def user_texts(payload):
    yield payload["legend"]
    if payload["account_warning"]:
        yield payload["account_warning"]
    for group in payload["groups"]:
        yield from (t for t in (group["label"], group["empty_message"], group["next_step"]) if t)
        for entry in group["items"]:
            yield entry["value_label"]
            yield entry["next_step"]
            yield from texts(entry)


def test_reference_uses_only_wins_closed_until_as_of(raw_dir):
    dataset = data.load(raw_dir)
    refs = triage.cycle_references(dataset.opportunities, context(dataset))
    assert refs["GTX Pro"] == {"p90_days": 59, "won_n": 1}
    assert refs["GTX Basic"] == {"p90_days": 138, "won_n": 1}
    assert refs["GTX Plus Pro"] == {"p90_days": None, "won_n": 0}


def test_base_rate_and_range(raw_dir):
    dataset = data.load(raw_dir)
    rate = triage.base_rate(dataset.opportunities, context(dataset))
    # 2 Won de 3 fechadas; 7 abertas: mínimo 2/10, máximo 9/10.
    assert rate == {"won": 2, "closed": 3, "open": 7, "pct": 67, "low_pct": 20, "high_pct": 90}


@pytest.mark.parametrize("value, expected", [(104.5, 105), (102.2, 102), (115.6, 116)])
def test_half_up_rounding(value, expected):
    assert triage.half_up(value) == expected


@pytest.mark.real_data
def test_real_references_and_base_rate(real_dataset):
    meta = views.meta(real_dataset, context(real_dataset))
    refs = meta["cycle_references"]
    assert refs["GTX Plus Pro"] == {"p90_days": 105, "won_n": 479}
    assert refs["GTK 500"]["won_n"] == 15
    assert min(r["p90_days"] for r in refs.values()) == 102
    assert max(r["p90_days"] for r in refs.values()) == 116
    assert meta["base_rate"] == {"won": 4238, "closed": 6711, "open": 2089,
                                 "pct": 63, "low_pct": 48, "high_pct": 72}


def test_focar_and_revisar_position_sentences(raw_dir):
    dataset = data.load(raw_dir)
    assert texts(detail(dataset, "E138"))[0] == (
        "Focar porque está em negociação há 138 dias, dentro do maior ciclo já fechado (138 d).")
    revisar = detail(dataset, "E139")  # AC-3.2
    assert texts(revisar)[0] == (
        "Revisar porque está em negociação há 139 dias, acima do maior ciclo já fechado (138 d).")
    assert "confirme no crm se segue ativa" in revisar["next_step"].lower()
    assert not any(word in " ".join(texts(revisar) + [revisar["next_step"]]).lower()
                   for word in ("perdida", "encerre"))


def test_prospecting_has_no_invented_age(raw_dir):
    entry = detail(data.load(raw_dir), "P1")
    assert texts(entry)[0] == "Qualificar porque ainda não tem data de engajamento."
    assert texts(entry)[2] == "Sem data de engajamento: não há idade para comparar."
    assert entry["age_days"] is None
    assert entry["next_step"] == policy.NEXT_STEPS[policy.QUALIFICAR]


def test_few_cases_are_flagged(raw_dir):  # AC-3.4 (N = 1 na fixture)
    assert texts(detail(data.load(raw_dir), "EGP"))[2].endswith("Poucos casos; leia como indicação.")


def test_product_without_wins_has_no_reference(raw_dir):  # AC-3.5
    sentence = texts(detail(data.load(raw_dir), "EPP"))[2]
    assert sentence.startswith("Sem vendas ganhas deste produto até 31/12/2017")


def test_fixture_explanations_are_verifiable_and_clean(raw_dir):
    payloads, items = all_items(data.load(raw_dir))
    for payload in payloads:
        for entry in (e for g in payload["groups"] for e in g["items"]):
            assert_verifiable(entry, payload["meta"])
        for text in list(user_texts(payload)) + [render_list(payload)]:
            assert_vocabulary(text)
    assert all(texts(entry)[-1].startswith(BASE_RATE_START) for entry in items)


def test_cli_explain_and_unknown_id(raw_dir, capsys):
    assert main(["--raw", str(raw_dir), "explain", "--id", "E138"]) == 0
    out = capsys.readouterr().out
    assert "Por que está aqui" in out and "Próximo passo:" in out
    assert main(["--raw", str(raw_dir), "explain", "--id", "NAOEXISTE"]) == 1
    assert "não encontrada" in capsys.readouterr().err


@pytest.mark.real_data
def test_real_focar_panel_01XZ9CRY(real_dataset):  # AC-3.1
    entry = detail(real_dataset, "01XZ9CRY")
    sentences = texts(entry)
    assert sentences[0] == ("Focar porque está em negociação há 104 dias, "
                            "dentro do maior ciclo já fechado (138 d).")
    assert "valor de tabela 5.482 (valor de tabela alto)" in sentences[1].lower()
    cycle = entry["explanation"][2]["fields"]
    assert (cycle["p90_days"], cycle["won_n"]) == (105, 479)
    assert "até 105 dias (N = 479)" in sentences[2]
    assert sentences[3].startswith(BASE_RATE_START)
    assert entry["next_step"] == ("Trabalhe primeiro os de maior valor de tabela; "
                                  "empates do mesmo produto valem o mesmo.")


@pytest.mark.real_data
def test_real_qualificar_panel_28EJ0L9T(real_dataset):  # AC-3.3
    entry = detail(real_dataset, "28EJ0L9T")
    assert (entry["product"], entry["account"], entry["age_days"]) == ("GTX Plus Pro", None, None)
    assert texts(entry)[0] == "Qualificar porque ainda não tem data de engajamento."
    assert "sem data de engajamento: não há idade para comparar" in texts(entry)[2].lower()
    assert entry["next_step"] == ("Ainda em prospecção: avance no CRM os de maior valor de tabela "
                                  "e registre a data de engajamento quando houver contato.")


@pytest.mark.real_data
def test_real_gtk500_few_cases(real_dataset):  # AC-3.4
    frame = real_dataset.opportunities
    gtk = frame[(frame["product"] == "GTK 500") & frame["deal_stage"].isin(policy.OPEN_STAGES)]
    sentence = texts(detail(real_dataset, gtk["opportunity_id"].iloc[0]))[2]
    assert "N = 15" in sentence and sentence.endswith("Poucos casos; leia como indicação.")


@pytest.mark.real_data
def test_real_2089_explanations_verifiable_and_clean(real_dataset):  # AC-3.7, AC-3.8
    payloads, items = all_items(real_dataset)
    assert len(items) == 2089
    for payload in payloads:
        meta = payload["meta"]
        for group in payload["groups"]:
            for entry in group["items"]:
                assert_verifiable(entry, meta)
                assert_vocabulary(render_detail({"meta": meta, "seller": payload["seller"], "item": entry}))
        for text in list(user_texts(payload)) + [render_list(payload)]:
            assert_vocabulary(text)
    assert all(texts(entry)[-1].startswith(BASE_RATE_START) for entry in items)
