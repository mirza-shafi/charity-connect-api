from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ZakatSettingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    nisab_value: float
    updated_at: datetime


class ZakatSettingUpdate(BaseModel):
    nisab_value: float = Field(gt=0)
