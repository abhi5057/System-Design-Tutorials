package com.ecommerce.order_system.repository;

import com.ecommerce.order_system.model.Order;
import com.ecommerce.order_system.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByStatus(OrderStatus status);
}
