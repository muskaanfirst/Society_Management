"""SocMag MLE compatibility service.

Scores how well a student's interest profile (feature_vector) matches a
society's ideal_persona using a Gaussian likelihood model: the ideal_persona
is treated as the mean of a multivariate Gaussian, and the student's vector
is scored by how likely it is under that Gaussian, normalized against the
peak likelihood (an exact match). The result is a 0-100% compatibility score.
"""

from typing import Dict, Optional

import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from scipy.stats import multivariate_normal

app = FastAPI(title="SocMag MLE Service")

INTEREST_TAGS = (
    "coding",
    "hardware",
    "design",
    "writing",
    "speaking",
    "acting",
    "impact",
    "startups",
)

DEFAULT_SIGMA = 0.25


class MLERequest(BaseModel):
    feature_vector: Dict[str, float] = Field(..., description="Student's interest-weight vector (0-1 per tag)")
    ideal_persona: Dict[str, float] = Field(..., description="Society's ideal interest-weight vector (0-1 per tag)")
    sigma: Optional[float] = Field(DEFAULT_SIGMA, gt=0, description="Gaussian spread applied to every dimension")


class MLEResponse(BaseModel):
    compatibility_score: float
    mahalanobis_distance: float
    per_dimension_deviation: Dict[str, float]


def _validate_keys(feature_vector: Dict[str, float], ideal_persona: Dict[str, float]) -> None:
    feature_keys = set(feature_vector.keys())
    ideal_keys = set(ideal_persona.keys())
    if feature_keys != ideal_keys:
        raise HTTPException(
            status_code=400,
            detail=(
                "feature_vector and ideal_persona must have the same keys. "
                f"feature_vector keys: {sorted(feature_keys)}, "
                f"ideal_persona keys: {sorted(ideal_keys)}"
            ),
        )
    unknown = feature_keys - set(INTEREST_TAGS)
    if unknown:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown interest tag(s): {sorted(unknown)}. Expected one of: {INTEREST_TAGS}",
        )


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/mle-engine", response_model=MLEResponse)
def mle_engine(request: MLERequest) -> MLEResponse:
    _validate_keys(request.feature_vector, request.ideal_persona)

    tags = sorted(request.feature_vector.keys())
    student_vec = np.array([request.feature_vector[t] for t in tags], dtype=float)
    ideal_vec = np.array([request.ideal_persona[t] for t in tags], dtype=float)

    sigma = request.sigma or DEFAULT_SIGMA
    cov = np.eye(len(tags)) * (sigma**2)

    gaussian = multivariate_normal(mean=ideal_vec, cov=cov)
    likelihood_at_student = gaussian.pdf(student_vec)
    likelihood_at_peak = gaussian.pdf(ideal_vec)

    compatibility_score = float(100 * (likelihood_at_student / likelihood_at_peak))

    deviation = student_vec - ideal_vec
    mahalanobis_distance = float(np.sqrt(np.sum((deviation / sigma) ** 2)))
    per_dimension_deviation = {tag: float(dev) for tag, dev in zip(tags, deviation)}

    return MLEResponse(
        compatibility_score=round(compatibility_score, 2),
        mahalanobis_distance=round(mahalanobis_distance, 4),
        per_dimension_deviation=per_dimension_deviation,
    )
