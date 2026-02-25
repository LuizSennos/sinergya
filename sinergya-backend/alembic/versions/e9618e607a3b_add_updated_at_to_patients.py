"""Add updated_at to patients"""

revision = "xxxxxx"
down_revision = "9ae9c1e88fe6"
branch_labels = None
depends_on = None

from alembic import op
import sqlalchemy as sa

def upgrade():
    op.add_column(
        "patients",
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=True
        )
    )

def downgrade():
    op.drop_column("patients", "updated_at")