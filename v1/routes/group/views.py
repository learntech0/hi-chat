from flask import Blueprint, redirect, render_template, flash, request, jsonify, url_for
from sqlalchemy import or_
from flask_login import current_user, login_required
from uuid import uuid4

from v1.models.user import User
from v1.models.chat import Chat
from v1.models.group import Group, UserGroup
from v1.models.db.group import get_groups_for_user
from v1.utils.helpers import update_account
from v1.utils.random import Generate


group_view = Blueprint('group_view', __name__, url_prefix='/')

@group_view.route("groups", methods=['GET', 'POST'])
@login_required
def groups(): 

    if request.method == 'POST' and 'groupname' in request.form:
        
        group_id = str(uuid4())
        groupname = request.form['groupname']
        description = request.form['description']
        inviteid = Generate.random_string(length=64)
        group = Group(group_id=group_id, group_name=groupname, description=description, invite_link=inviteid)
        group.save()

        join_group = UserGroup(user_id=current_user.user_id, group_id=group_id, is_admin=True)
        join_group.save()

        flash(f'{groupname} group created!', 'success')  

    if request.method == 'POST' and 'username' in request.form:

        form = request.form

        username = User.get_username(username=form['username'])

        if username:
            flash("Username is taken. Please choose a different username", "error")
    
        email = User.get_email(email=form['email'])

        if email:
            flash("Email already exists", "error")
        
        success, err = update_account(form)

        if success:
            flash('Account updated!', 'success')
        else:
            flash(f'Error updating account: {err}', 'error')

    return render_template('_partials/group_list.html', title='Groups')


@group_view.route("get_groups", methods=['GET'])
def get_groups():
    user_id = current_user.user_id
    q = request.args.get('query', '').strip()
    if not q:
        q = None
    groups = get_groups_for_user(user_id, query=q)

    groups_data = []
    if groups:
        # Fetch the latest chat for each user
        for group in groups:

            members = UserGroup.query.filter_by(group_id = group.group_id).all()

            for member in members:                
                latest_chat = (
                    Chat.query.filter(
                        or_(
                            ((Chat.sender_id == user_id) & (Chat.receiver_id == group.group_id)),
                            ((Chat.sender_id == member.user_id) & (Chat.receiver_id == group.group_id))
                        )
                    )
                    .order_by(Chat.id.desc())
                    .first()
                )

                group_data = {
                    'group_id': group.group_id,
                    'name': group.group_name,
                    'profile': group.profile
                }

                if latest_chat and latest_chat.message:
                    message = latest_chat.message
                    if latest_chat.sender_id == current_user.user_id:
                        if len(message) < 60:
                            message = 'You: ' + latest_chat.message.replace('\n', ' ')
                        else:
                            message = 'You: ' + latest_chat.message[:60] + '...'.replace('\n', ' ')
                    else:
                        if len(message) < 65:
                            message = latest_chat.message.replace('\n', ' ')
                        else:
                            message = latest_chat.message[:65] + '...'.replace('\n', ' ')
                    time = latest_chat.time.strftime('%H:%M')

                    group_data['latest_chat'] = {
                        'message': message,
                        'time': time
                    }

                groups_data.append(group_data)

    return jsonify({'groups': groups_data})

@group_view.route("group", methods=['GET', 'POST'])
@login_required
def group():

    group = None
    members = None
    messages = None

    # Get group id
    group_id = request.args.get('group_id')

    if group_id:

        groupuser = UserGroup.query.filter((UserGroup.group_id==group_id) & (UserGroup.user_id == current_user.user_id)).first()

        if not groupuser:
            return redirect(url_for('group_view.group'))

        group = Group.query.filter_by(group_id=group_id).first()

        user_group = UserGroup.query.filter_by(group_id=group_id).all()

        for user in user_group:
            members = User.query.filter_by(user_id=user.user_id).all()

        messages = Chat.query.filter(Chat.receiver_id==group_id).order_by(Chat.id).all() 

    if request.method == 'POST' and 'username' in request.form:
        form = request.form

        username = User.get_username(username=form['username'])

        if username:
            flash("Username is taken. Please choose a different username", "error")
    
        email = User.get_email(email=form['email'])

        if email:
            flash("Email already exists", "error")
        
        success, err = update_account(form)
        
        if success:
            flash('Account updated!', 'success')
        else:
            flash(f'Error updating account: {err}', 'error')

    
    return render_template('group.html', title='Group', group=group, members=members, messages=messages)


@group_view.route("get_group_messages", methods=['GET'])
def get_messages():
    if current_user: 
        group_id = request.args.get('group_id')

        if group_id:
            message_list = []

            messages = Chat.query.filter(Chat.receiver_id == group_id).order_by(Chat.id).all() 

            for message in messages:
                
                user = User.query.filter_by(user_id=message.sender_id).first()

                message_data = {
                    'receiver_id': message.receiver_id,
                    'time': message.time.strftime('%Y-%m-%d_%H:%M'),
                    'sender': {
                        'id': message.sender_id,
                        'username': user.username,
                        'profile': user.profile
                    }
                }

                if message.message:
                    message_data['message'] = message.message

                if message.filename:
                    message_data['file'] = message.filename

                message_list.append(message_data)
        else:
            return jsonify({'error': 'group_id not provided'}), 400
        
    else:
        return jsonify({'error': 'unauthorized'}), 401

    return jsonify({'messages': message_list})


@group_view.route("join-group/<string:id>", methods=['GET'])
@login_required
def join_group(id):

    if not id:
        return redirect(url_for('group_view.group'))
    
    invite_id = id
    
    group = Group.query.filter_by(invite_link=invite_id).first()

    if group:

        group_id = group.group_id
        group_url = url_for('group_view.group')

        groupuser = UserGroup.query.filter((UserGroup.group_id==group_id) & (UserGroup.user_id == current_user.user_id)).first()

        if groupuser:
            return redirect(group_url + f'?group_id={group_id}')
        
        join_group = UserGroup(user_id=current_user.user_id, group_id=group_id)
        join_group.save()

        return redirect(group_url + f'?group_id={group_id}')

    else:
        flash(f'Invalid invite id!', 'error')
        
        return redirect(url_for('group_view.group'))
