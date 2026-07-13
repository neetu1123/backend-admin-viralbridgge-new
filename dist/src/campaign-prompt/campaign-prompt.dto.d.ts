export declare const CAMPAIGN_PROMPT_EVENTS: readonly ["DISPLAYED", "CLOSED", "CREATE_CLICKED", "CAMPAIGN_CREATED"];
export type CampaignPromptEventType = (typeof CAMPAIGN_PROMPT_EVENTS)[number];
export declare class CampaignPromptEventDto {
    eventType: CampaignPromptEventType;
    metadata?: Record<string, unknown>;
}
