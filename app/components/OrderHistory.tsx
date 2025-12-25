/* eslint-disable */
import {useEffect} from 'react';
import {useFetcher} from 'react-router';
import type {CustomerOrdersQuery} from 'customer-accountapi.generated'; // adjust path if needed

// Type for a single order
type Order =
  CustomerOrdersQuery['customer']['orders']['nodes'][number];

export function OrderHistory() {
  const ordersFetcher = useFetcher<CustomerOrdersQuery>();

  useEffect(() => {
    if (ordersFetcher.state === 'idle' && !ordersFetcher.data) {
      ordersFetcher.load('/account/orders');
    }
  }, [ordersFetcher]);

  const orders: Order[] =
    ordersFetcher.data?.customer?.orders?.nodes ?? [];

  return (
    <div className="border border-green-800 p-3 mb-6 text-sm">
      <div className="bg-green-900 text-black px-2 mb-2 font-bold uppercase">
        ORDER HISTORY
      </div>

      {orders.length === 0 ? (
        <p className="opacity-60">NO ORDERS FOUND</p>
      ) : (
        <div className="space-y-1">
          {orders.map((order, idx) => (
            <div
              key={order.id}
              className="flex justify-between px-1 py-0.5 border-b border-green-800 hover:bg-green-800 hover:text-black transition-colors"
            >
              <span>
                {idx + 1}. {order.name}
              </span>

              <span>
                {order.totalPrice.amount}{' '}
                {order.totalPrice.currencyCode}
              </span>

              <span className="uppercase">
                {order.financialStatus}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
