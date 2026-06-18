package com.ecommerce.order_system.service;

import com.ecommerce.order_system.dto.CreateOrderRequest;
import com.ecommerce.order_system.exception.InvalidOperationException;
import com.ecommerce.order_system.exception.ResourceNotFoundException;
import com.ecommerce.order_system.model.Order;
import com.ecommerce.order_system.model.OrderItem;
import com.ecommerce.order_system.model.OrderStatus;
import com.ecommerce.order_system.dao.OrderDao;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderDao orderDao;

    @Override
    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        log.info("Creating order for customer: {}", request.getCustomerEmail());
        Order order = Order.builder()
                .customerEmail(request.getCustomerEmail())
                .status(OrderStatus.PENDING)
                .build();

        List<OrderItem> items = request.getItems().stream().map(dto ->
            OrderItem.builder()
                    .productId(dto.getProductId())
                    .quantity(dto.getQuantity())
                    .price(dto.getPrice())
                    .build()
        ).collect(Collectors.toList());

        items.forEach(order::addItem);

        Order savedOrder = orderDao.save(order);
        log.info("Successfully created order with id: {}", savedOrder.getId());
        return savedOrder;
    }

    @Override
    @Transactional(readOnly = true)
    public Order getOrderById(Long id) {
        log.debug("Fetching order with id: {}", id);
        return orderDao.findById(id)
                .orElseThrow(() -> {
                    log.error("Order not found with id: {}", id);
                    return new ResourceNotFoundException("Order not found with id: " + id);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Order> getAllOrders(OrderStatus status, Pageable pageable) {
        log.debug("Fetching all orders with status: {} and pagination: {}", status, pageable);
        if (status != null) {
            return orderDao.findByStatus(status, pageable);
        }
        return orderDao.findAll(pageable);
    }

    @Override
    @Transactional
    public Order updateOrderStatus(Long id, OrderStatus newStatus) {
        log.info("Updating order status for id: {} to {}", id, newStatus);
        Order order = getOrderById(id);
        order.setStatus(newStatus);
        return orderDao.save(order);
    }

    @Override
    @Transactional
    public void cancelOrder(Long id) {
        log.info("Attempting to cancel order id: {}", id);
        Order order = getOrderById(id);

        if (order.getStatus() != OrderStatus.PENDING) {
            log.warn("Failed to cancel order id: {}. Current status is {}", id, order.getStatus());
            throw new InvalidOperationException("Only orders in PENDING status can be cancelled. Current status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderDao.save(order);
        log.info("Successfully cancelled order id: {}", id);
    }
}
