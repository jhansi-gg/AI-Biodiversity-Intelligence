import os
import chromadb
from chromadb.utils.embedding_functions import DefaultEmbeddingFunction


# ============================================================
# TERRAMIND AI - LIGHTWEIGHT RAG KNOWLEDGE BASE
# ============================================================

# Use Chroma's lightweight built-in embedding function
embedding_function = DefaultEmbeddingFunction()


# Use an absolute path based on the project location
BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../..")
)

CHROMA_PATH = os.path.join(
    BASE_DIR,
    "backend",
    "rag",
    "chroma_db"
)

KNOWLEDGE_PATH = os.path.join(
    BASE_DIR,
    "data",
    "knowledge"
)


client = chromadb.PersistentClient(
    path=CHROMA_PATH
)

collection = client.get_or_create_collection(
    name="biodiversity_knowledge",
    embedding_function=embedding_function
)


# ============================================================
# LOAD KNOWLEDGE
# ============================================================

def load_knowledge():

    documents = []
    ids = []
    metadatas = []

    for root, dirs, files in os.walk(KNOWLEDGE_PATH):

        for file in files:

            if not file.endswith(".txt"):
                continue

            file_path = os.path.join(
                root,
                file
            )

            try:

                with open(
                    file_path,
                    "r",
                    encoding="utf-8"
                ) as f:

                    content = f.read()

                if not content.strip():
                    continue

                documents.append(content)

                # Use relative path as ID
                relative_path = os.path.relpath(
                    file_path,
                    BASE_DIR
                )

                ids.append(relative_path)

                category = os.path.basename(root)

                metadatas.append({
                    "category": category,
                    "filename": file
                })

            except Exception as error:

                print(
                    f"Could not read {file_path}: {error}"
                )

    if documents:

        # Chroma generates embeddings automatically
        collection.upsert(
            documents=documents,
            ids=ids,
            metadatas=metadatas
        )

    return len(documents)


# ============================================================
# CATEGORY DETECTION
# ============================================================

def detect_categories(query):

    query = query.lower()

    categories = []

    if any(word in query for word in [
        "soil",
        "organic carbon",
        "soc",
        "ph",
        "moisture"
    ]):
        categories.append("soil")

    if any(word in query for word in [
        "rainfall",
        "temperature",
        "heat",
        "climate",
        "water availability",
        "drought"
    ]):
        categories.append("climate")

    if any(word in query for word in [
        "biodiversity",
        "species",
        "habitat",
        "pollinator",
        "species richness",
        "habitat diversity"
    ]):
        categories.append("biodiversity")

    if any(word in query for word in [
        "monoculture",
        "agroforestry",
        "crop diversity",
        "land use",
        "land-use",
        "fragmentation"
    ]):
        categories.append("land_use")

    if any(word in query for word in [
        "pollution",
        "deforestation",
        "human impact",
        "habitat loss",
        "soil degradation"
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


# ============================================================
# SEARCH KNOWLEDGE
# ============================================================

def search_knowledge(query, top_k=4):

    categories = detect_categories(query)

    # --------------------------------------------------------
    # Semantic search without category filtering
    # --------------------------------------------------------

    if not categories:

        return collection.query(
            query_texts=[query],
            n_results=top_k,
            include=[
                "documents",
                "metadatas",
                "distances"
            ]
        )

    # --------------------------------------------------------
    # Category-based semantic search
    # --------------------------------------------------------

    all_documents = []
    all_metadatas = []
    all_distances = []

    for category in categories:

        try:

            results = collection.query(
                query_texts=[query],
                n_results=2,
                where={
                    "category": category
                },
                include=[
                    "documents",
                    "metadatas",
                    "distances"
                ]
            )

            if results.get("documents"):

                all_documents.extend(
                    results["documents"][0]
                )

                all_metadatas.extend(
                    results["metadatas"][0]
                )

                all_distances.extend(
                    results["distances"][0]
                )

        except Exception as error:

            print(
                f"Category search error ({category}): {error}"
            )

    # --------------------------------------------------------
    # Combine and rank results
    # --------------------------------------------------------

    combined = list(zip(
        all_documents,
        all_metadatas,
        all_distances
    ))

    combined.sort(
        key=lambda x: x[2]
    )

    combined = combined[:top_k]

    return {
        "documents": [
            [item[0] for item in combined]
        ],
        "metadatas": [
            [item[1] for item in combined]
        ],
        "distances": [
            [item[2] for item in combined]
        ]
    }