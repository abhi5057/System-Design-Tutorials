package com.ecommerce.order_system.controller;

import com.ecommerce.order_system.dto.CreateOrderRequest;
import com.ecommerce.order_system.dto.UpdateOrderStatusRequest;
import com.ecommerce.order_system.model.Order;
import com.ecommerce.order_system.model.OrderStatus;
import com.ecommerce.order_system.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Order Controller", description = "Operations pertaining to orders in E-commerce System")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Create a new order")
    public ResponseEntity<Order> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        Order createdOrder = orderService.createOrder(request);
        return new ResponseEntity<>(createdOrder, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get an order by its ID")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        Order order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }

    @GetMapping
    @Operation(summary = "List all orders, optionally filtered by status")
    public ResponseEntity<List<Order>> getAllOrders(@RequestParam(required = false) OrderStatus status) {
        List<Order> orders = orderService.getAllOrders(status);
        return ResponseEntity.ok(orders);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update the status of an order")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        Order updatedOrder = orderService.updateOrderStatus(id, request.getStatus());
        return ResponseEntity.ok(updatedOrder);
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel an order (only if PENDING)")
    public ResponseEntity<Void> cancelOrder(@PathVariable Long id) {
        orderService.cancelOrder(id);
        return ResponseEntity.noContent().build();
    }
}
