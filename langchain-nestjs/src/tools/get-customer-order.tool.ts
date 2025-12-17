import {Tool} from "@langchain/core/tools";
import { z } from "zod";

export class GetCustomerOrderTool extends Tool {
    name = "get_customer_order";
    description = "Получает детали заказа. ВАЖНО: всегда сообщайте пользователю и товары, и статус заказа из полученного ответа.";

    protected async _call(customerId: string): Promise<string> {
        console.log(`[DB Query]: Ищем заказы для ${customerId}...`);

        // Имитируем базу данных (в реальности здесь будет fetch или prisma.query)
        const mockDb: Record<string, any> = {
            "CUST-123": { id: "ORD-99", items: "Laptop, Mouse", status: "Shipped" },
            "CUST-456": { id: "ORD-101", items: "Keyboard", status: "Processing" },
        };

        const order = mockDb[customerId];

        if (!order) {
            return `Заказ для клиента ${customerId} не найден. Проверьте правильность ID.`;
        }

        return `Заказ ${order.id}: товары - ${order.items}, статус - ${order.status}.`;
    }
}