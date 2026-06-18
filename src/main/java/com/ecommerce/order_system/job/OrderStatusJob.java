package com.ecommerce.order_system.job;

import com.ecommerce.order_system.model.Order;
import com.ecommerce.order_system.model.OrderStatus;
import com.ecommerce.order_system.dao.OrderDao;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderStatusJob {

    private final OrderDao orderDao;

    /**
     * This job runs every 5 minutes and updates all PENDING orders to PROCESSING.
     */
    @Scheduled(cron = "0 */5 * * * *")
    @Transactional
    public void processPendingOrders() {
        log.info("Running background job to update PENDING orders to PROCESSING...");

        List<Order> pendingOrders = orderDao.findByStatus(OrderStatus.PENDING);

        if (pendingOrders.isEmpty()) {
            log.info("No PENDING orders found.");
            return;
        }

        log.info("Found {} PENDING orders to process.", pendingOrders.size());

        for (Order order : pendingOrders) {
            order.setStatus(OrderStatus.PROCESSING);
        }

        orderDao.saveAll(pendingOrders);
        log.info("Successfully updated {} orders to PROCESSING.", pendingOrders.size());
    }
}
