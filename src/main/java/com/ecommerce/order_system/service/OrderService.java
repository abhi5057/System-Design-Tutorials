package com.ecommerce.order_system.service;

import com.ecommerce.order_system.dto.CreateOrderRequest;
import com.ecommerce.order_system.model.Order;
import com.ecommerce.order_system.model.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    Order createOrder(CreateOrderRequest request);
    Order getOrderById(Long id);
    Page<Order> getAllOrders(OrderStatus status, Pageable pageable);
    Order updateOrderStatus(Long id, OrderStatus newStatus);
    void cancelOrder(Long id);
}
