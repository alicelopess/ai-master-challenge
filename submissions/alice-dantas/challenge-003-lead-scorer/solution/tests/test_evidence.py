"""Evidência do backtest servida como dado (contrato v4, AC-4.5)."""
import json

import pytest
from fastapi.testclient import TestClient

from api.main import create_app
from api.schemas import Evidence
from leadscorer import codes, evidence, policy
from leadscorer.errors import DataError

from conftest import EVIDENCE_RESULTS, write_evidence


def test_strategies_in_report_order_without_the_leak(evidence_path):
    result = evidence.load(evidence_path)
    assert [r["code"] for r in result["rankers"]] == list(codes.RANKER_CODES)
    assert codes.RANKER_LEAK_QUARTER_END not in json.dumps(result)
    assert result["reference"] == codes.RANKER_CURRENT_RULE
    assert [r["code"] for r in result["without_no_outcome"]] == [
        codes.RANKER_LIST_PRICE_ONLY, codes.RANKER_CURRENT_RULE, codes.RANKER_RULE_A]


def test_numbers_are_the_backtest_numbers(evidence_path):
    result = evidence.load(evidence_path)
    source = {e["code"]: e for e in EVIDENCE_RESULTS["summary"]}
    for ranker in result["rankers"]:
        entry = source[ranker["code"]]
        assert {k: ranker[k] for k in evidence.METRICS} == {k: entry[k] for k in evidence.METRICS}
        assert ranker["cuts_auc_above_chance"] == entry["cuts_ci_above_half"]
        if ranker["code"] == codes.RANKER_CURRENT_RULE:
            assert ranker["delta_val"] is None and ranker["cuts_val_above_reference"] is None
        else:
            assert ranker["delta_val"] == {"value": entry["d_val_at_k"], "low": entry["d_val_low"],
                                           "high": entry["d_val_high"]}
    assert all(r["cuts_auc_above_chance"] is None for r in result["without_no_outcome"])
    assert result["design"] == {k: EVIDENCE_RESULTS["design"][k] for k in evidence.DESIGN}


@pytest.mark.parametrize("content", [None, "{não é json", json.dumps({"design": {}})])
def test_missing_or_broken_file_is_a_coded_error(tmp_path, content):
    path = tmp_path / "backtest_results.json"
    if content is not None:
        path.write_text(content, encoding="utf-8")
    with pytest.raises(DataError) as error:
        evidence.load(path)
    assert (error.value.code, error.value.params) == (codes.EVIDENCE_UNAVAILABLE, {"file": path.name})


def test_unknown_strategy_code_is_refused(tmp_path):
    broken = json.loads(json.dumps(EVIDENCE_RESULTS))
    broken["summary"][0]["code"] = "alta_chance"
    with pytest.raises(DataError):
        evidence.load(write_evidence(tmp_path / "r.json", broken))


def test_api_serves_evidence_and_503_without_it(raw_dir, evidence_path, tmp_path):
    response = TestClient(create_app(raw_dir, evidence_path)).get("/api/evidence")
    assert response.status_code == 200
    assert Evidence.model_validate(response.json()).model_dump(mode="json") == response.json()
    missing = TestClient(create_app(raw_dir, tmp_path / "nada.json")).get("/api/evidence")
    assert missing.status_code == 503
    assert missing.json()["code"] == codes.EVIDENCE_UNAVAILABLE and missing.json()["params"] == {"file": "nada.json"}


def test_evidence_does_not_need_the_csvs(evidence_path, tmp_path):
    assert TestClient(create_app(tmp_path / "sem-csv", evidence_path)).get("/api/evidence").status_code == 200


def test_committed_result_is_served_with_the_audited_numbers():
    """O resultado versionado (gerado com os CSVs auditados) é o que a página mostra."""
    result = evidence.load(policy.EVIDENCE_PATH)
    rankers = {r["code"]: r for r in result["rankers"]}
    without = {r["code"]: r for r in result["without_no_outcome"]}
    assert result["design"]["audited_data"] is True and len(result["design"]["cuts"]) == 7
    assert (rankers["current_rule"]["val_at_k"], rankers["list_price_only"]["val_at_k"]) == (0.569, 0.538)
    assert rankers["list_price_only"]["delta_val"] == {"value": -0.031, "low": -0.044, "high": -0.019}
    assert without["current_rule"]["val_at_k"] == without["list_price_only"]["val_at_k"] == 0.791
