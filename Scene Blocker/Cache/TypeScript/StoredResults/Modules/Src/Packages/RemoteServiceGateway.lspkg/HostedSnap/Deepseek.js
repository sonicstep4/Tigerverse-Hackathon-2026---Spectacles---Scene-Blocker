"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeepSeek = void 0;
/**
 * Specs Inc. 2026
 * Snap-hosted DeepSeek R1 AI integration for chat completions. Provides access to DeepSeek's
 * advanced reasoning model with function calling, streaming, and tool use capabilities through
 * Snap's Remote Service Gateway infrastructure.
 */
const RemoteServiceGatewayCredentials_1 = require("../RemoteServiceGatewayCredentials");
const RSM_COMPLETIONS = requireAsset("./RemoteServiceModules/Deepseek_Completions.remoteServiceModule");
class DeepSeek {
    /**
     * Performs a chat completion request to Snap hosted DeepSeek API.
     * @param deepSeekRequest The request object containing the chat completion parameters.
     * @returns A promise that resolves with the chat completion response.
     * @link https://api-docs.deepseek.com/api/create-chat-completion
     */
    static chatCompletions(deepSeekRequest) {
        return new Promise((resolve, reject) => {
            const submitApiRequest = RemoteApiRequest.create();
            const apiToken = RemoteServiceGatewayCredentials_1.RemoteServiceGatewayCredentials.getApiToken(RemoteServiceGatewayCredentials_1.AvaliableApiTypes.Snap);
            submitApiRequest.endpoint = "chat_completions";
            submitApiRequest.parameters = {
                "api-token": apiToken
            };
            const textBody = JSON.stringify(deepSeekRequest);
            submitApiRequest.body = textBody;
            RSM_COMPLETIONS.performApiRequest(submitApiRequest, function (resp) {
                if (resp.statusCode == 1) {
                    const bodyJson = JSON.parse(resp.body);
                    resolve(bodyJson);
                }
                else {
                    reject(resp.body);
                }
            });
        });
    }
    ;
}
exports.DeepSeek = DeepSeek;
//# sourceMappingURL=Deepseek.js.map