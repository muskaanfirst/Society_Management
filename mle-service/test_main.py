"""Unit tests for the SocMag MLE compatibility service.

Run with: pytest test_main.py -v
"""

from fastapi.testclient import TestClient

from main import INTEREST_TAGS, app

client = TestClient(app)


def _vector(value: float) -> dict:
    return {tag: value for tag in INTEREST_TAGS}


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_perfect_match_scores_100():
    persona = _vector(0.5)
    response = client.post(
        "/mle-engine",
        json={"feature_vector": persona, "ideal_persona": persona},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["compatibility_score"] == 100.0
    assert body["mahalanobis_distance"] == 0.0
    assert all(dev == 0.0 for dev in body["per_dimension_deviation"].values())


def test_opposite_vectors_score_near_zero():
    response = client.post(
        "/mle-engine",
        json={"feature_vector": _vector(0.0), "ideal_persona": _vector(1.0)},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["compatibility_score"] < 1.0
    assert body["mahalanobis_distance"] > 10.0


def test_mismatched_keys_rejected():
    feature_vector = _vector(0.5)
    ideal_persona = _vector(0.5)
    del ideal_persona["coding"]
    response = client.post(
        "/mle-engine",
        json={"feature_vector": feature_vector, "ideal_persona": ideal_persona},
    )
    assert response.status_code == 400


def test_unknown_interest_tag_rejected():
    bad_vector = _vector(0.5)
    bad_vector["underwater_basket_weaving"] = 0.5
    response = client.post(
        "/mle-engine",
        json={"feature_vector": bad_vector, "ideal_persona": bad_vector},
    )
    assert response.status_code == 400


def test_missing_required_field_rejected():
    response = client.post(
        "/mle-engine",
        json={"feature_vector": _vector(0.5)},  # ideal_persona omitted
    )
    assert response.status_code == 422
