import {data} from 'react-router';
import type {Route} from './+types/cart';

export async function action({request, context}: Route.ActionArgs) {
  const {cart} = context;

  if (request.method !== 'POST') {
    return data({error: 'Method not allowed'}, {status: 405});
  }

  const body = await request.json();

  // ✅ Intentional TS bridge (Hydrogen internal API)
  const result = await (cart as any).update(body);

  const headers = result?.cart?.id
    ? cart.setCartId(result.cart.id)
    : new Headers();

  return data(result, {headers});
}

export async function loader({context}: Route.LoaderArgs) {
  return context.cart.get();
}

export default function CartRoute() {
  return null;
}
