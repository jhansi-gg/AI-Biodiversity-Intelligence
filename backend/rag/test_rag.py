from knowledge_base import load_knowledge, search_knowledge


count = load_knowledge()

print("Knowledge files loaded:", count)

results = search_knowledge(
    "How does low rainfall affect soil and biodiversity?"
)

print("\nRetrieved knowledge:")
print(results["documents"])