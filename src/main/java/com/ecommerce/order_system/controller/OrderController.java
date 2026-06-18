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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Order Controller", description = "Operations pertaining to orders in E-commerce System")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Create a new order")
    public ResponseEntity<Order> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        log.info("REST request to create an order received");
        Order createdOrder = orderService.createOrder(request);
        return new ResponseEntity<>(createdOrder, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get an order by its ID")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        log.info("REST request to get order with id: {}", id);
        Order order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }

    @GetMapping
    @Operation(summary = "List all orders, optionally filtered by status, with pagination")
    public ResponseEntity<Page<Order>> getAllOrders(
            @RequestParam(required = false) OrderStatus status,
            Pageable pageable) {
        log.info("REST request to get all orders with status: {} and pageable: {}", status, pageable);
        Page<Order> orders = orderService.getAllOrders(status, pageable);
        return ResponseEntity.ok(orders);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update the status of an order")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        log.info("REST request to update order status for id: {} to {}", id, request.getStatus());
        Order updatedOrder = orderService.updateOrderStatus(id, request.getStatus());
        return ResponseEntity.ok(updatedOrder);
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel an order (only if PENDING)")
    public ResponseEntity<Void> cancelOrder(@PathVariable Long id) {
        log.info("REST request to cancel order with id: {}", id);
        orderService.cancelOrder(id);
        return ResponseEntity.noContent().build();
    }
}
