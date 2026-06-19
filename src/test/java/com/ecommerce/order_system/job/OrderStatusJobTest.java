package com.ecommerce.order_system.job;

import com.ecommerce.order_system.dao.OrderDao;
import com.ecommerce.order_system.model.Order;
import com.ecommerce.order_system.model.OrderStatus;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderStatusJobTest {

    @Mock
    private OrderDao orderDao;

    @InjectMocks
    private OrderStatusJob orderStatusJob;

    @Test
    void processPendingOrders_WhenPendingOrdersExist_ShouldUpdateToProcessing() {
        // Arrange
        Order order1 = Order.builder().id(1L).status(OrderStatus.PENDING).build();
        Order order2 = Order.builder().id(2L).status(OrderStatus.PENDING).build();
        List<Order> pendingOrders = List.of(order1, order2);

        when(orderDao.findByStatus(OrderStatus.PENDING)).thenReturn(pendingOrders);

        // Act
        orderStatusJob.processPendingOrders();

        // Assert
        assertEquals(OrderStatus.PROCESSING, order1.getStatus());
        assertEquals(OrderStatus.PROCESSING, order2.getStatus());
        verify(orderDao, times(1)).saveAll(pendingOrders);
    }

    @Test
    void processPendingOrders_WhenNoPendingOrders_ShouldDoNothing() {
        // Arrange
        when(orderDao.findByStatus(OrderStatus.PENDING)).thenReturn(Collections.emptyList());

        // Act
        orderStatusJob.processPendingOrders();

        // Assert
        verify(orderDao, never()).saveAll(any());
    }
}
