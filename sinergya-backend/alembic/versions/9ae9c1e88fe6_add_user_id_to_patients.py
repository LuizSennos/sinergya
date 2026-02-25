"""Add user_id to patients

Revision ID: 9ae9c1e88fe6
Revises: 09d541a56696
Create Date: 2026-02-23
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic.
revision = "9ae9c1e88fe6"
down_revision = "09d541a56696"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "patients",
        sa.Column(
            "user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=True,  # depois você pode tornar NOT NULL
        ),
    )
    op.create_index("ix_patients_user_id", "patients", ["user_id"])


def downgrade():
    op.drop_index("ix_patients_user_id", table_name="patients")
    op.drop_column("patients", "user_id")