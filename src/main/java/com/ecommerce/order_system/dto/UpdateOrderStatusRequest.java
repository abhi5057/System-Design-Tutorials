package com.ecommerce.order_system.dto;

import com.ecommerce.order_system.model.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateOrderStatusRequest {
    @NotNull(message = "Status cannot be null")
    private OrderStatus status;
}
