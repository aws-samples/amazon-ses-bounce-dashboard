import {EventBridgeClient, PutEventsCommand} from "@aws-sdk/client-eventbridge";

export const ebClient = new EventBridgeClient();

export const sendEventToBus = async ({bus = "default", type, event}) => {
    try {
        const eventos = {
            Entries: [
                {
                    EventBusName: bus,
                    Source: "io.febos.ses",
                    DetailType: type,
                    Detail: JSON.stringify(event)
                },
            ],
        }
        const data = await ebClient.send(new PutEventsCommand(eventos));
        console.log("Success, event sent; requestID:", data);
        return data; // For unit tests.
    } catch (err) {
        console.log("Error", err);
    }
};
