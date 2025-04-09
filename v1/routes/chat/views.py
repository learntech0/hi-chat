import os
from flask import Blueprint, render_template, flash, request, jsonify, current_app
from sqlalchemy import or_
from datetime import datetime, timedelta
from flask_login import current_user, login_required

from v1 import db
from v1.utils.helpers import update_account, save_picture
from v1.models.user import User
from v1.models.chat import Chat
from v1.models.db.user import query_contact_users

chat_view = Blueprint('chat_view', __name__, url_prefix='/')

@chat_view.route("users", methods=['GET', 'POST'])
@login_required
def user():

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
    
    return render_template('_partials/user_list.html', title='Users', current_user=current_user)
    

@chat_view.route("test", methods=['GET'])
def test():
    return render_template('test.html', title='Test')

@chat_view.route("get_users", methods=['GET'])
def get_contact_users():
    user_id = current_user.user_id
    q = request.args.get('query', '').strip()

    users = query_contact_users(user_id, q)

    users_data = []
    if users:
        # Fetch the latest chat for each user
        for user in users:
            latest_chat = (
                Chat.query.filter(
                    or_(
                        ((Chat.sender_id == user.user_id) & (Chat.receiver_id == current_user.user_id)),
                        ((Chat.sender_id == current_user.user_id) & (Chat.receiver_id == user.user_id))
                    )
                )
                .order_by(Chat.id.desc())
                .first()
            )

            user_data = {
                'user_id': user.user_id,
                'name': user.username,
                'profile': user.profile
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

                user_data['latest_chat'] = {
                    'message': message,
                    'time': time
                }

            users_data.append(user_data)


    return jsonify({'users': users_data})

@chat_view.route("chat", methods=['GET', 'POST'])
@login_required
def chat():
    user = None

    # Get incoming user
    user_id = request.args.get('user_id')
    status = None
    if user_id:
        current_time = datetime.now()
        user = User.query.filter_by(user_id=user_id).first()
        status = user.status
        if status.strftime('%Y-%m-%d %H:%M') == current_time.strftime('%Y-%m-%d %H:%M'):
            status = 'Online'
        elif status.date() == current_time.date():
            status = f'Today {status.strftime("%H:%M")}'
        elif status.date() == current_time.date() - timedelta(days=1):
            status = f'Yesterday {status.strftime("%H:%M")}'
        elif current_time - timedelta(days=7) <= status:
            status = f'{status.strftime("%A")} {status.strftime("%H:%M")}'
        else:
            status = status.strftime('%Y-%m-%d')

    messages = ( 
        Chat.query.filter(
            (
                (Chat.sender_id == current_user.user_id) & (Chat.receiver_id == user_id)
            )
            | (
                (Chat.sender_id == user_id) & (Chat.receiver_id == current_user.user_id)
            )
        ).order_by(Chat.id).all()    
    )

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

    
    return render_template('chat.html', title='Chat', target_user=user, messages=messages, status=status)


@chat_view.route("get_user_messages", methods=['GET'])
def get_messages():
    if current_user: 
        user_id = request.args.get('user_id')
        if user_id:
            messages = ( 
                    Chat.query.filter(
                        (
                            (Chat.sender_id == current_user.user_id) & (Chat.receiver_id == user_id)
                        )
                        | (
                            (Chat.sender_id == user_id) & (Chat.receiver_id == current_user.user_id)
                        )
                    ).order_by(Chat.id).all()    
                )

            message_list = []

            for message in messages:

                message_data = {
                    'sender_id': message.sender_id,
                    'receiver_id': message.receiver_id,
                    'time': message.time.strftime('%Y-%m-%d_%H:%M'),
                }

                if message.message:
                    message_data['message'] = message.message

                if message.filename:
                    message_data['file'] = message.filename

                message_list.append(message_data)

        else:
            return jsonify({'error': 'user_id not provided'}), 400
        
    else:
        return jsonify({'error': 'unauthorized'}), 401

    return jsonify({'messages': message_list})

@chat_view.route("upload_profile", methods=['POST'])
def upload_image():
    file = request.files.get('file')
    old_picture_filename = current_user.profile
    if file:
        picture_file = save_picture(file, old_picture_filename)
        current_user.profile = picture_file
        db.session.commit()
        return jsonify({'success': True, 'message': 'File uploaded successfully'})
    else:
        if old_picture_filename != 'default.png':
            old_picture_path = os.path.join(current_app.root_path, 'static/images/profile', old_picture_filename)
            if os.path.exists(old_picture_path):
                os.remove(old_picture_path)
        current_user.profile = 'default.png'
        db.session.commit()
        return jsonify({'success': True, 'message': 'Profile picture unlinked successfully'})

