
from v1.models.group import Group, UserGroup


# Function to get all groups for a given user with optional group_name filter
def get_groups_for_user(user_id, query=None):
    base_query = UserGroup.query.filter_by(user_id=user_id)

    if query:
        base_query = base_query.join(Group).filter(Group.group_name.ilike(f'%{query}%'))

    user_groups = base_query.all()
    group_ids = [user_group.group_id for user_group in user_groups]
    groups = Group.query.filter(Group.group_id.in_(group_ids)).all()
    return groups