import json
import os

table_name = 'ses-email'

os.environ.setdefault('TABLE_EMAIL_NAME', table_name)

event_data = '../../../events/sqs_send_email_event.json'
with open(event_data, 'r') as f:
    event = json.load(f)
    print("event", event)


def test_send_email():
    from ses_send_notification_sqs import handler
    response = handler(event, '')
    print("response", response)
