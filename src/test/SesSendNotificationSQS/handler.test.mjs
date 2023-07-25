import {handler} from "../../node/SesSendNotificationSQS";

const evento = {
    "Records": [
        {
            "messageId": "9ed48016-f363-415b-9074-bb9e3d3df0ed",
            "receiptHandle": "AQEBgx6czChaM+hdNYrXpxSx9B23JEEUGKWT9ovrbmFjQEYvm70fOv9s0lcy5zeQNLiEXE8ljtoTRgocay+2QD3NYfhE3RExXG+u1RUTDSz9aXmFyX6mn32YBSHGEZaOrV6GE00a206ks9ys20ecTZCO1FMYabtsr7cQIRZQSulrYZxUzlmPQ5SZq+vc8fcAo+14oqnkUdl1jD9i9C7kHyx/q3c4/359Zggxyfs7bDhgF7OFPbcBoGqeyMpRGmrpBV6R4tZpU1yV66h+2yLvNLZF6wgTwjv0XHw9MzfXD+67kFE=",
            "body": "{\"id\":\"145c422f-55a6-4051-91f1-1c59a67e9261\",\"messageId\":null,\"documentoId\":null,\"pais\":\"global\",\"stage\":\"produccion\",\"domain\":\"empresas.febos.cl\",\"manifiesto\":\"febos-io/global/produccion/email/145c422f-55a6-4051-91f1-1c59a67e9259/145c422f-55a6-4051-91f1-1c59a67e9259.json\",\"empresa\":\"0\",\"application\":\"FEB\",\"timestamp\":\"2023-07-21T20:32:40.061Z\"}",
            "attributes": [
                "Object"
            ],
            "messageAttributes": {},
            "md5OfBody": "e140c1368f7e8f97b371afe614e2b6b7",
            "eventSource": "aws:sqs",
            "eventSourceARN": "arn:aws:sqs:us-east-1:830321976775:ses-send-email.fifo",
            "awsRegion": "us-east-1"
        }
    ]
}

handler(evento, {})