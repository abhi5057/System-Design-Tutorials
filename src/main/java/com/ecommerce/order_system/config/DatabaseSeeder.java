package com.ecommerce.order_system.config;

import com.ecommerce.order_system.dao.OrderDao;
import com.ecommerce.order_system.model.Order;
import com.ecommerce.order_system.model.OrderItem;
import com.ecommerce.order_system.model.OrderStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final OrderDao orderDao;

    @Override
    public void run(String... args) {
        log.info("Checking if database seeding is required...");

        if (orderDao.findAll(Pageable.unpaged()).isEmpty()) {
            log.info("Database is empty. Injecting mock e-commerce records...");
            seedOrders();
            log.info("Database seeding completed successfully.");
        } else {
            log.info("Database already contains data. Seeding skipped.");
        }
    }

    private void seedOrders() {
        // Order 1: Pending (Will be picked up by the 5-minute background job)
        Order order1 = Order.builder()
                .customerEmail("john.doe@example.com")
                .status(OrderStatus.PENDING)
                .build();
        order1.addItem(OrderItem.builder().productId("PROD-1001").quantity(2).price(new BigDecimal("19.99")).build());
        order1.addItem(OrderItem.builder().productId("PROD-1002").quantity(1).price(new BigDecimal("149.99")).build());

        // Order 2: Processing
        Order order2 = Order.builder()
                .customerEmail("alice.smith@corporate.com")
                .status(OrderStatus.PROCESSING)
                .build();
        order2.addItem(OrderItem.builder().productId("PROD-2055").quantity(1).price(new BigDecimal("899.00")).build());

        // Order 3: Shipped
        Order order3 = Order.builder()
                .customerEmail("bob.builder@construction.io")
                .status(OrderStatus.SHIPPED)
                .build();
        order3.addItem(OrderItem.builder().productId("PROD-3099").quantity(50).price(new BigDecimal("4.50")).build());
        order3.addItem(OrderItem.builder().productId("PROD-1001").quantity(10).price(new BigDecimal("19.99")).build());

        // Order 4: Delivered
        Order order4 = Order.builder()
                .customerEmail("charlie.brown@peanuts.net")
                .status(OrderStatus.DELIVERED)
                .build();
        order4.addItem(OrderItem.builder().productId("PROD-5000").quantity(1).price(new BigDecimal("12.00")).build());

        // Order 5: Pending
        Order order5 = Order.builder()
                .customerEmail("test.user@ecommerce.com")
                .status(OrderStatus.PENDING)
                .build();
        order5.addItem(OrderItem.builder().productId("PROD-7777").quantity(3).price(new BigDecimal("49.99")).build());

        orderDao.saveAll(List.of(order1, order2, order3, order4, order5));
    }
}
