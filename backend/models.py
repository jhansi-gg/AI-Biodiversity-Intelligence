from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    email = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    password_hash = Column(
        String,
        nullable=False
    )


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        nullable=False
    )

    soil_organic_carbon = Column(String)
    soil_ph = Column(String)
    rainfall = Column(String)
    temperature = Column(String)
    crop = Column(String)
    land_use = Column(String)

    recommendation = Column(String)
    impacted_metrics = Column(String)
    risks = Column(String)