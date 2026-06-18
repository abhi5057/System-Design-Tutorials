package com.ecommerce.order_system.service;

import com.ecommerce.order_system.dto.CreateOrderRequest;
import com.ecommerce.order_system.exception.InvalidOperationException;
import com.ecommerce.order_system.exception.ResourceNotFoundException;
import com.ecommerce.order_system.model.Order;
import com.ecommerce.order_system.model.OrderItem;
import com.ecommerce.order_system.model.OrderStatus;
import com.ecommerce.order_system.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;

    @Override
    @Transactional
    public Order createOrder(CreateOrderRequest request) {
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

        return orderRepository.save(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Order> getAllOrders(OrderStatus status, Pageable pageable) {
        if (status != null) {
            return orderRepository.findByStatus(status, pageable);
        }
        return orderRepository.findAll(pageable);
    }

    @Override
    @Transactional
    public Order updateOrderStatus(Long id, OrderStatus newStatus) {
        Order order = getOrderById(id);
        order.setStatus(newStatus);
        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public void cancelOrder(Long id) {
        Order order = getOrderById(id);

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new InvalidOperationException("Only orders in PENDING status can be cancelled. Current status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }
}
