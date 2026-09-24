from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class CitationItem(BaseModel):
    """Represents an individual statutory citation or legal reference."""

    number: int = Field(
        default=1, description="1-indexed citation reference identifier"
    )
    label: str = Field(description="Name or title of statutory authority / legal code")
    snippet: str = Field(description="Relevant excerpt or provision summary")


class ChatRequest(BaseModel):
    """Inbound statutory Q&A query payload."""

    query: str = Field(
        ..., min_length=1, max_length=4000, description="User legal question"
    )
    session_id: Optional[str] = Field(
        None, description="Optional conversation session identifier"
    )


class ChatResponse(BaseModel):
    """Response returned from legal Q&A endpoint."""

    answer: str = Field(description="Contextually grounded statutory analysis")
    citations: List[Dict[str, Any]] = Field(
        default_factory=list, description="Grounding statutory references"
    )
    session_id: str = Field(description="Active conversation session ID")


class AnalysisResponse(BaseModel):
    """Document risk and clause simplification response."""

    filename: str = Field(description="Sanitized name of analyzed document")
    char_count: int = Field(description="Number of characters extracted and evaluated")
    analysis: Dict[str, Any] = Field(
        description="Structured contract breakdown and risk scores"
    )


class ComparisonResponse(BaseModel):
    """Two-version agreement cross-comparison diff response."""

    doc_a: str = Field(description="Filename of primary baseline agreement")
    doc_b: str = Field(description="Filename of secondary or counterparty agreement")
    comparison: Dict[str, Any] = Field(
        description="Semantic clause differences and risks"
    )


class LawyerPrepResponse(BaseModel):
    """Attorney consultation briefing sheet response."""

    filename: str = Field(description="Filename of reviewed document")
    briefing: Dict[str, Any] = Field(
        description="Structured briefing notes and consultation questions"
    )


class HealthResponse(BaseModel):
    """Health check endpoint status."""

    status: str = Field(default="ok")
    service: str = Field(default="Juris AI")
    version: str = Field(default="0.1.0")


class ErrorResponse(BaseModel):
    """Standardized API error response."""

    success: bool = False
    error: str = Field(description="User-friendly error explanation")
    detail: Optional[str] = Field(
        None, description="Optional sanitized diagnostic detail"
    )


class Citation(BaseModel):
    source: list[str] = Field(description="Document name where the data is fetched")


class structured_output(BaseModel):
    answer: str = Field(
        description="Answer to the user query which is retrieved from the vector store."
    )
    source: Citation = Field(description="Sources that support the answer")
