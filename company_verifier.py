import re


def extract_company_name(message):
    """Extract a possible company name; this is not company verification."""
    if not isinstance(message, str) or not message.strip():
        return None

    patterns = [
        r"\bcompany\s*(?:name)?\s*(?:is|:)\s*([A-Z][A-Za-z0-9&'-]*(?:\s+[A-Z][A-Za-z0-9&'-]*){0,3})",
        r"\b(?:selected|hired|job|position|offer|working)\s+at\s+([A-Z][A-Za-z0-9&'-]*(?:\s+[A-Z][A-Za-z0-9&'-]*){0,3})",
        r"\b(?:from|with)\s+([A-Z][A-Za-z0-9&'-]*(?:\s+[A-Z][A-Za-z0-9&'-]*){0,3})\s+(?:company|recruitment|careers|team)",
    ]

    for pattern in patterns:
        match = re.search(pattern, message, re.IGNORECASE)
        if match:
            candidate = match.group(1).strip(" .,;:-")
            if len(candidate) >= 2:
                return candidate

    return None


def resolve_company_name(message, user_company_name=None):
    if isinstance(user_company_name, str) and user_company_name.strip():
        return user_company_name.strip(), "User provided"

    extracted = extract_company_name(message)
    if extracted:
        return extracted, "Automatically extracted"

    return None, "Not identified"
