package com.ecommerce.order_system.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class CreateOrderRequest {

    @Email(message = "Valid email is required")
    @NotEmpty(message = "Customer email cannot be empty")
    private String customerEmail;

    @Valid
    @NotEmpty(message = "Order must contain at least one item")
    private List<OrderItemDto> items;
}
