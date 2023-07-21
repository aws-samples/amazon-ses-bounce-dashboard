1. Deploy the backend application:

```sh
sam build
sam deploy --guided --stack-name='ses-event-manager'
```

If you already have deployed stack

```sh
sam build
sam sync --stack-name='ses-event-manager'
```


