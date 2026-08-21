export type ObjectionPrep={objection:string;responseFramework:string;requiresHumanDelivery:true};
const frameworks:Record<string,string>={
 price:'Acknowledge budget concern, connect price to verified scope/value, and avoid inventing discounts or ROI.',
 existing_vendor:'Respect the existing relationship, identify gaps only from evidence, and offer a low-risk comparison/demo.',
 timing:'Clarify timing and business priority; propose a next step without false urgency.',
 trust:'Use verifiable evidence, demo behavior, process transparency, and clear limitations instead of guarantees.'
};
export function prepareObjection(type:keyof typeof frameworks):ObjectionPrep{
 return {objection:type,responseFramework:frameworks[type],requiresHumanDelivery:true};
}
