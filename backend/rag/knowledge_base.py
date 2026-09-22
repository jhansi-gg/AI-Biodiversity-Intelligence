import os
import chromadb
from sentence_transformers import SentenceTransformer

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

client = chromadb.PersistentClient(path="backend/rag/chroma_db")

collection = client.get_or_create_collection(
    name="biodiversity_knowledge"
)


def load_knowledge():
    knowledge_path = "data/knowledge"

    documents = []
    ids = []
    metadatas = []

    for root, dirs, files in os.walk(knowledge_path):
        for file in files:
            if file.endswith(".txt"):
                file_path = os.path.join(root, file)

                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()

                documents.append(content)
                ids.append(file_path)

                category = os.path.basename(root)

                metadatas.append({
                    "category": category,
                    "filename": file
                })

    if documents:
        embeddings = embedding_model.encode(documents).tolist()

        collection.upsert(
            documents=documents,
            embeddings=embeddings,
            ids=ids,
            metadatas=metadatas
        )

    return len(documents)


def detect_categories(query):
    query = query.lower()

    categories = []

    if any(word in query for word in [
        "soil", "organic carbon", "soc", "ph", "moisture"
    ]):
        categories.append("soil")

    if any(word in query for word in [
        "rainfall", "temperature", "heat", "climate",
        "water availability", "drought"
    ]):
        categories.append("climate")

    if any(word in query for word in [
        "biodiversity", "species", "habitat", "pollinator",
        "species richness", "habitat diversity"
    ]):
        categories.append("biodiversity")

    if any(word in query for word in [
        "monoculture", "agroforestry", "crop diversity",
        "land use", "land-use", "fragmentation"
    ]):
        categories.append("land_use")

        if any(word in query for word in [
        "pollution", "deforestation", "human impact",
        "habitat loss", "soil degradation"
    ]):
         categories.append("human_impact")

    if any(word in query for word in [
        "scientific evidence",
        "scientific source",
        "research",
        "study",
        "paper",
        "evidence",
        "muchane",
        "fao",
        "ipcc",
        "agroforestry evidence"
    ]):
        categories.append("sources")

    return categories


def search_knowledge(query, top_k=4):

    categories = detect_categories(query)

    # If no specific category is detected,
    # perform normal semantic search.
    if not categories:
        query_embedding = embedding_model.encode([query]).tolist()

        return collection.query(
            query_embeddings=query_embedding,
            n_results=top_k,
            include=["documents", "metadatas", "distances"]
        )

    # Search separately inside each relevant category.
    all_documents = []
    all_metadatas = []
    all_distances = []

    query_embedding = embedding_model.encode([query]).tolist()

    for category in categories:

        results = collection.query(
            query_embeddings=query_embedding,
            n_results=2,
            where={"category": category},
            include=["documents", "metadatas", "distances"]
        )

        if results["documents"]:
            all_documents.extend(results["documents"][0])
            all_metadatas.extend(results["metadatas"][0])
            all_distances.extend(results["distances"][0])

    # Combine and sort by semantic distance
    combined = list(zip(
        all_documents,
        all_metadatas,
        all_distances
    ))

    combined.sort(key=lambda x: x[2])

    combined = combined[:top_k]

    return {
        "documents": [[item[0] for item in combined]],
        "metadatas": [[item[1] for item in combined]],
        "distances": [[item[2] for item in combined]]
    }