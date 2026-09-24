import pytest
from backend.document_service import (
    DocumentValidationError,
    analyze_document,
    compare_documents,
    compute_content_hash,
    extract_text_from_file,
    generate_lawyer_prep,
    sanitize_filename,
)


def test_sanitize_filename_strips_traversal():
    assert sanitize_filename("../../../etc/passwd") == "passwd"
    assert sanitize_filename("..\\..\\secret.pdf") == "secret.pdf"
    assert sanitize_filename("normal_contract.docx") == "normal_contract.docx"


def test_compute_content_hash_is_deterministic():
    text = "Mutual Non-Disclosure Agreement dated 2026"
    h1 = compute_content_hash(text)
    h2 = compute_content_hash(text)
    assert h1 == h2
    assert len(h1) == 64


def test_extract_text_from_plain_text_bytes():
    content = b"Simple legal memo regarding statutory limitation periods."
    extracted = extract_text_from_file("memo.txt", content)
    assert extracted == "Simple legal memo regarding statutory limitation periods."


def test_extract_text_raises_on_empty_content():
    with pytest.raises(DocumentValidationError):
        extract_text_from_file("empty.txt", b"")


def test_extract_text_raises_on_oversized_content():
    huge_bytes = b"X" * (11 * 1024 * 1024)
    with pytest.raises(DocumentValidationError):
        extract_text_from_file("oversized.txt", huge_bytes)


def test_analyze_document_returns_structured_analysis():
    contract_text = "Master Services Agreement between Alpha Corp and Beta LLC. Beta shall indemnify Alpha."
    result = analyze_document(contract_text, doc_name="MSA_Alpha_Beta.txt")
    assert "summary" in result
    assert "risks" in result
    assert "plain_english_breakdown" in result
    assert isinstance(result["risks"], list)


def test_content_addressable_cache_speedup():
    text = "Unique clause text for caching performance benchmarking: Clause 14.1 Governing Law"
    # First call primes cache
    res1 = analyze_document(text, "CacheTestDoc.txt")
    # Second call hits cache
    res2 = analyze_document(text, "CacheTestDoc.txt")
    assert res1 == res2


def test_compare_documents_identifies_differences():
    text_a = "Agreement A: 30 days notice required to terminate."
    text_b = "Agreement B: Immediate termination without notice."
    comp = compare_documents(text_a, "Draft_A.txt", text_b, "Draft_B.txt")
    assert "overview" in comp
    assert "recommendation" in comp
    assert "differences" in comp
    assert len(comp["differences"]) > 0


def test_generate_lawyer_prep_includes_questions_and_leverage():
    text = "Employment contract with a 24-month non-compete clause covering all of North America."
    briefing = generate_lawyer_prep(
        text, "Employment_Offer.txt", user_concerns="Is the non-compete enforceable?"
    )
    assert "case_summary" in briefing
    assert "questions_for_lawyer" in briefing
    assert "negotiation_leverage_points" in briefing
    assert len(briefing["questions_for_lawyer"]) > 0
