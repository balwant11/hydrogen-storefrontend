import type {CustomerFragment} from 'customer-accountapi.generated';

export default function Addresses({
  customer,
}: {
  customer: CustomerFragment;
}) {
  const {defaultAddress, addresses} = customer;

  return (
    <div className="border border-green-800 p-3">
    <div className="bg-green-900 text-black px-2 mb-2 font-bold uppercase">
      My address
    </div>
      {!addresses.nodes.length ? (
        <p>You don't have any saved addresses yet.</p>
      ) : (
        <div className="space-y-4">
          {addresses.nodes.map((address) => (
            <div
              key={address.id}
              className="border border-green-800 p-3 rounded"
            >
              <p className='text-sm !text-sm'>{address.firstName} {address.lastName}</p>
              <p className='text-sm !text-sm'>{address.address1}</p>
              {address.address2 && <p className='text-sm !text-sm'>{address.address2}</p>}
              <p className='text-sm !text-sm'>
                {address.city}, {address.zoneCode} {address.zip}
              </p>
              {/* <p>{address.countryCode}</p> */}

              {defaultAddress?.id === address.id && (
                <p className="text-yellow-400 mt-1 text-sm !text-sm">
                  DEFAULT ADDRESS
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
