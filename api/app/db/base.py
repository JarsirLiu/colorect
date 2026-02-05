"""
数据库基类
"""
from sqlalchemy import Column, Integer, DateTime, func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class TimestampMixin:
    """时间戳混入类"""
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        comment="创建时间"
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        comment="更新时间"
    )


class BaseModel(Base):
    """基础模型类"""
    __abstract__ = True

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, comment="主键ID")

    def __repr__(self):
        return f"<{self.__class__.__name__} {self.id}>"
