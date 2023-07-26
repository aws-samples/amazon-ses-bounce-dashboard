import os
import boto3


def get_dynamo_client():
    aws_environment = os.environ.get('AWSENV', 'AWS')
    if aws_environment == 'AWS_SAM_LOCAL':
        activities_table = boto3.resource(
            'dynamodb',
            endpoint_url='http://dynamodb:8000'
        )
    else:
        activities_table = boto3.resource(
            'dynamodb'
        )
    return activities_table
