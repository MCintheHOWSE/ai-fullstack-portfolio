// Price Calculator for Logistics System
// Calculates estimated delivery price based on items, floors, and distance

export const PRICING_CONFIG = {
    BASE_PRICE: 200,          // 基礎運費
    FLOOR_PRICE: 50,          // 每層樓費用（無電梯）
    ITEM_PRICE: 20,           // 每件物品費用
    VEHICLE_MULTIPLIER: {     // 車型加成
        motorcycle: 1.0,
        car: 1.2,
        van: 1.5,
        truck: 2.0
    }
};

export const STANDARD_ITEMS = {
    box_l: { name: '大箱子', icon: '📦', basePrice: 20 },
    box_s: { name: '小箱子', icon: '📦', basePrice: 15 },
    suitcase: { name: '行李箱', icon: '🧳', basePrice: 15 },
    chair: { name: '椅子', icon: '🪑', basePrice: 20 },
    desk: { name: '書桌', icon: '🗄️', basePrice: 50 },
    bicycle: { name: '腳踏車', icon: '🚲', basePrice: 30 },
    guitar: { name: '吉他', icon: '🎸', basePrice: 25 },
    mattress: { name: '床墊', icon: '🛏️', basePrice: 60 },
    fan: { name: '電風扇', icon: '💨', basePrice: 25 },
    mini_fridge: { name: '小冰箱', icon: '🧊', basePrice: 40 }
};

/**
 * Calculate estimated price for delivery
 * @param {Object} params - Calculation parameters
 * @param {Object} params.items - Items object with counts (e.g., {box_l: 2, chair: 1})
 * @param {number} params.floor_origin - Origin floor number
 * @param {number} params.floor_dest - Destination floor number
 * @param {boolean} params.has_elevator_origin - Has elevator at origin
 * @param {boolean} params.has_elevator_dest - Has elevator at destination
 * @param {string} params.vehicle_type - Vehicle type (motorcycle, car, van, truck)
 * @returns {number} - Estimated price in NT$
 */
export function calculatePrice({
    items = {},
    floor_origin = 0,
    floor_dest = 0,
    has_elevator_origin = false,
    has_elevator_dest = false,
    vehicle_type = null
}) {
    let price = PRICING_CONFIG.BASE_PRICE;

    // 計算樓層費用（無電梯時）
    if (!has_elevator_origin && floor_origin > 1) {
        price += (floor_origin - 1) * PRICING_CONFIG.FLOOR_PRICE;
    }
    if (!has_elevator_dest && floor_dest > 1) {
        price += (floor_dest - 1) * PRICING_CONFIG.FLOOR_PRICE;
    }

    // 計算物品費用
    let totalItemPrice = 0;
    for (const [itemKey, count] of Object.entries(items)) {
        if (itemKey !== 'special' && count > 0) {
            const itemInfo = STANDARD_ITEMS[itemKey];
            const itemPrice = itemInfo ? itemInfo.basePrice : PRICING_CONFIG.ITEM_PRICE;
            totalItemPrice += itemPrice * count;
        }
    }
    price += totalItemPrice;

    // 車型加成
    if (vehicle_type && PRICING_CONFIG.VEHICLE_MULTIPLIER[vehicle_type]) {
        price *= PRICING_CONFIG.VEHICLE_MULTIPLIER[vehicle_type];
    }

    return Math.round(price);
}

/**
 * Get total item count
 * @param {Object} items - Items object with counts
 * @returns {number} - Total number of items
 */
export function getTotalItemCount(items = {}) {
    return Object.entries(items)
        .filter(([key]) => key !== 'special')
        .reduce((sum, [, count]) => sum + (count || 0), 0);
}

/**
 * Validate items JSON
 * @param {Object} items - Items object
 * @returns {boolean} - Whether items are valid
 */
export function validateItems(items) {
    if (!items || typeof items !== 'object') return false;

    for (const [key, value] of Object.entries(items)) {
        if (key !== 'special' && (typeof value !== 'number' || value < 0)) {
            return false;
        }
    }

    return true;
}

/**
 * Get recommended vehicle type based on items
 * @param {Object} items - Items object with counts
 * @returns {string} - Recommended vehicle type
 */
export function getRecommendedVehicle(items) {
    const totalCount = getTotalItemCount(items);
    const hasLargeItems = items.desk > 0 || items.mattress > 0;

    if (hasLargeItems || totalCount > 10) return 'truck';
    if (totalCount > 5) return 'van';
    if (totalCount > 2) return 'car';
    return 'motorcycle';
}
