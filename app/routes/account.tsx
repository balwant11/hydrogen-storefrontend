import {
  data as remixData,
  Form,
  NavLink,
  Outlet,
  useLoaderData,
} from 'react-router';
import type {Route} from './+types/account';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';

export function shouldRevalidate() {
  return true;
}

export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  return remixData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayout() {
  const {customer} = useLoaderData<typeof loader>();

  return (
    <div className="w-full h-full bg-blue-900/95 text-green-400 p-8 font-mono overflow-y-auto">
      {/* HEADER */}
      <div className="flex justify-between border-b-2 border-green-500 mb-4 pb-2">
        <h2 className="text-2xl font-bold blink">ACCOUNT</h2>
        <span>{new Date().toLocaleTimeString()}</span>
      </div>

      {/* CUSTOMER INFO */}
      <div className="mb-6 border border-green-800 p-3 text-sm">
        <div className="bg-green-900 text-black px-2 mb-2 font-bold uppercase">
          CUSTOMER INFO
        </div>
        <p>
          NAME:{' '}
          <span className="text-yellow-400">
            {customer.firstName} {customer.lastName}
          </span>
        </p>
        <p>
          EMAIL:{' '}
          <span className="text-yellow-400">
            {customer.emailAddress?.emailAddress}
          </span>
        </p>
      </div>

      {/* MENU */}
      <AccountMenu />

      <div className="mt-6">
        <Outlet context={{customer}} />
      </div>
    </div>
  );
}

function AccountMenu() {
  return (
    <div className="border border-green-800 p-3 text-sm mb-6">
      <div className="bg-green-900 text-black px-2 mb-2 font-bold uppercase">
        MENU
      </div>

      <nav className="flex flex-col gap-1">
        <TeleLink to="/account/orders">1-1 ORDERS</TeleLink>
        <TeleLink to="/account/profile">1-2 PROFILE</TeleLink>
        <TeleLink to="/account/addresses">1-3 ADDRESSES</TeleLink>
        <Logout />
      </nav>
    </div>
  );
}

function TeleLink({to, children}: {to: string; children: React.ReactNode}) {
  return (
    <NavLink
      to={to}
      className={({isActive}) =>
        `px-2 py-1 ${
          isActive
            ? 'bg-yellow-400 text-black'
            : 'hover:bg-green-800 hover:text-black'
        }`
      }
    >
      {children}
    </NavLink>
  );
}

function Logout() {
  return (
    <Form className="account-logout" method="POST" action="/account/logout">
      &nbsp;
      <button className="text-red-400 hover:bg-red-800 px-2 py-1">
        SIGN OUT
      </button>
    </Form>
  );
}
