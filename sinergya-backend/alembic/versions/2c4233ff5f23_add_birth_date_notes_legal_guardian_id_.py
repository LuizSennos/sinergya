"""add birth_date, notes, legal_guardian_id to patients

Revision ID: 2c4233ff5f23
Revises: xxxxxx
Create Date: 2026-02-23 20:01:17.832369

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '2c4233ff5f23'
down_revision: Union[str, None] = 'xxxxxx'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # adiciona colunas novas na tabela patients
    op.add_column('patients', sa.Column('birth_date', sa.Date(), nullable=True))
    op.add_column('patients', sa.Column('notes', sa.Text(), nullable=True))
    op.add_column('patients', sa.Column('legal_guardian_id', sa.UUID(), nullable=True))


def downgrade() -> None:
    # remove colunas caso seja feito rollback
    op.drop_column('patients', 'birth_date')
    op.drop_column('patients', 'notes')
    op.drop_column('patients', 'legal_guardian_id')
