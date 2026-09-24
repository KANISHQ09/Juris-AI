import io
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_health_check_returns_ok():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "Juris AI"


def test_security_headers_present_on_all_responses():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.headers.get("x-content-type-options") == "nosniff"
    assert response.headers.get("x-frame-options") == "DENY"
    assert "max-age=31536000" in response.headers.get("strict-transport-security", "")
    assert response.headers.get("referrer-policy") == "strict-origin-when-cross-origin"


def test_rate_limiting_headers_on_api_endpoints():
    response = client.post(
        "/api/chat", json={"query": "What are tenant notice rights?"}
    )
    assert response.status_code == 200
    assert "x-ratelimit-limit" in response.headers
    assert "x-ratelimit-remaining" in response.headers


def test_chat_endpoint_returns_structured_answer_and_citations():
    payload = {
        "query": "What is the limitation period for breach of contract?",
        "session_id": "test_session_1",
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert len(data["answer"]) > 10
    assert "citations" in data
    assert isinstance(data["citations"], list)
    assert data["session_id"] == "test_session_1"


def test_document_analyze_endpoint_with_valid_text():
    sample_text = b"STANDARD NON-DISCLOSURE AGREEMENT\n1. Recipient agrees to hold proprietary code strictly confidential for two years."
    file = ("agreement.txt", io.BytesIO(sample_text), "text/plain")
    response = client.post("/api/documents/analyze", files={"file": file})
    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "agreement.txt"
    assert data["char_count"] > 0
    assert "analysis" in data
    assert "summary" in data["analysis"]
    assert "risks" in data["analysis"]


def test_document_analyze_rejects_unsupported_file_extension():
    bad_file = (
        "script.exe",
        io.BytesIO(b"malicious_executable_bytes"),
        "application/octet-stream",
    )
    response = client.post("/api/documents/analyze", files={"file": bad_file})
    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["detail"]


def test_document_analyze_rejects_empty_file():
    empty_file = ("empty.txt", io.BytesIO(b""), "text/plain")
    response = client.post("/api/documents/analyze", files={"file": empty_file})
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_document_compare_endpoint():
    doc_a = (
        "draft_v1.txt",
        io.BytesIO(
            b"Party A shall give 30 days notice to cure breach before termination."
        ),
        "text/plain",
    )
    doc_b = (
        "draft_v2.txt",
        io.BytesIO(
            b"Party B may terminate immediately upon notice with zero cure period."
        ),
        "text/plain",
    )
    response = client.post(
        "/api/documents/compare", files={"file_a": doc_a, "file_b": doc_b}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["doc_a"] == "draft_v1.txt"
    assert data["doc_b"] == "draft_v2.txt"
    assert "comparison" in data
    assert "differences" in data["comparison"]


def test_lawyer_prep_endpoint():
    sample_contract = b"CONSULTING AGREEMENT\nConsultant waives all claims to background IP and agrees to unlimited unilateral indemnification."
    file = ("consulting.txt", io.BytesIO(sample_contract), "text/plain")
    response = client.post(
        "/api/documents/lawyer-prep",
        files={"file": file},
        data={
            "user_concerns": "I am worried about losing my prior background patents."
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "consulting.txt"
    assert "briefing" in data
    assert "questions_for_lawyer" in data["briefing"]
    assert len(data["briefing"]["questions_for_lawyer"]) > 0
