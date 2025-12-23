export const CART_FRAGMENT = `#graphql
  fragment CartFragment on Cart {
    id
    totalQuantity
    cost {
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 50) {
      edges {
        node {
          id
          quantity
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              product {
                title
              }
            }
          }
        }
      }
    }
  }
`;
