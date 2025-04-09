from flask import Blueprint, render_template, flash, request
from flask_login import current_user, login_required

from v1.models.contact import Contact
from v1.models.user import User
from v1.models.db.contact import get_contacts
from v1.utils.validators import AddContactForm
from v1.utils.helpers import add_contact, update_account

contact_view = Blueprint('contact_view', __name__, url_prefix='/')

@contact_view.route("get_contacts", methods=['GET'])
@login_required
def get_contacts_endpoint():
    user_id = current_user.user_id
    return get_contacts(user_id)


@contact_view.route("contacts", methods=['GET', 'POST'])
@login_required
def contacts():

    cform = AddContactForm()
    if cform.validate_on_submit():
        user = User.query.filter_by(username=cform.username.data).first()
        if user:
            if user.user_id != current_user.user_id:
                contact = Contact.query.filter_by(contact_id=user.user_id).first()
                if contact:
                    flash(f"Contact with this username exist!", 'warning')
                else:
                    success, err = add_contact(user)
                    if success:
                        flash(f'Contact added!', 'success')
                    else:
                        flash(f'Error adding contact: {err}', 'error')     
            else:
                flash(f"You cannot add yourself!", 'warning')
        else:
            flash(f'There is no user with that username.', 'warning')

    if request.method == 'POST' and 'email' in request.form:
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

    return render_template('_partials/contact_list.html', title='Contacts', cform=cform)

@contact_view.route("contact", methods=['GET', 'POST'])
@login_required
def contact():

    cform = AddContactForm()
    if cform.validate_on_submit():
        user = User.query.filter_by(username=cform.username.data).first()
        if user:
            if user.user_id != current_user.user_id:
                contact = Contact.query.filter_by(contact_id=user.user_id).first()
                if contact:
                    flash(f"Contact with this username exist!", 'warning')
                else:
                    success, err = add_contact(user)
                    if success:
                        flash(f'Contact added!', 'success')
                    else:
                        flash(f'Error adding contact: {err}', 'error')     
            else:
                flash(f"You cannot add yourself!", 'warning')
        else:
            flash(f'There is no user with that username.', 'warning')

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

    return render_template('contact.html', title='Contact', cform=cform)