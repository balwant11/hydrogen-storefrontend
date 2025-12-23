import React, {useState, useEffect, useRef, Suspense} from 'react';
import {
  ShoppingCart,
  Power,
  Grid,
  CreditCard,
  Volume2,
  VolumeX,
  Plus,
  Minus,
  X,
  ChevronDown,
} from 'lucide-react';
import {CartForm} from '@shopify/hydrogen';
import {Await, useRouteLoaderData} from 'react-router';
import type {RootLoader} from '~/root';
import type { CollectionsWithProductsQuery } from 'storefrontapi.generated';

// 👉 ADD THIS BELOW ALL IMPORTS

type VariantNode = {
  id: string;
  price: {
    amount: string;
  };
  selectedOptions: {
    name: string;
    value: string;
  }[];
};

type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  type: string;
  variants: string[];
  sizes: string[];
  variantNodes: VariantNode[];
};

type Category = {
  id: string;
  name: string;
  products: Product[];
};

// --- Mock Data ---
type ShopifyCollection = {
  id: string;
  title: string;
  products: {
    nodes: {
      id: string;
      title: string;
      description: string;
      featuredImage?: {
        url: string;
      };
      variants: {
        nodes: {
          id: string;
          price: {
            amount: string;
          };
          selectedOptions: {
            name: string;
            value: string;
          }[];
        }[];
      };
    }[];
  };
};

// --- Sub Components ---

const Scanlines = () => (
  <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_4px,3px_100%] pointer-events-none" />
    <div className="animate-scan absolute inset-0 bg-white/5 opacity-[0.03] pointer-events-none" />
  </div>
);

const ScreenGlare = () => (
  <div className="pointer-events-none absolute inset-0 z-30 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0)_60%,rgba(0,0,0,0.2)_100%)] shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
    <div className="absolute top-4 left-4 w-32 h-16 bg-white/5 blur-xl rounded-full transform -rotate-12" />
  </div>
);

const NoiseEffect = () => (
  <div className="absolute inset-0 z-10 bg-gray-800 flex items-center justify-center overflow-hidden">
    <div className="absolute inset-0 animate-noise opacity-80 contrast-150 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
    <div className="relative z-20 text-white font-mono text-xl font-bold opacity-80 tracking-widest drop-shadow-md">
      NO SIGNAL
    </div>
  </div>
);

// --- Main App Component ---
type RetroTVStoreProps = {
  collections: CollectionsWithProductsQuery['collections']['nodes'];
};

export default function RetroTVStore({collections}: RetroTVStoreProps) {
  const [isOn, setIsOn] = useState(false);
  const [isTurningOff, setIsTurningOff] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true); // State for the first-time user prompt
  const [categoryIdx, setCategoryIdx] = useState(0);
  const [productIdx, setProductIdx] = useState(0);
  const [variantIdx, setVariantIdx] = useState(0);
  const [sizeIdx, setSizeIdx] = useState(0); // New size state
  const [staticEffect, setStaticEffect] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  // const [cart, setCart] = useState<Product[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const rootData = useRouteLoaderData<RootLoader>('root');
  const cart = rootData?.cart;

  const categories: Category[] = (collections ?? []).map((collection) => ({
    id: collection.id,
    name: collection.title.toUpperCase(),
    products: (collection.products?.nodes ?? []).map((product) => {
      const variants = product.variants.nodes;

      const colorSet = new Set<string>();
      const sizeSet = new Set<string>();

      variants.forEach((v) => {
        v.selectedOptions.forEach((o) => {
          if (o.name === 'Color') colorSet.add(o.value);
          if (o.name === 'Size') sizeSet.add(o.value);
        });
      });

      return {
        id: product.id,
        name: product.title,
        description: product.description,
        image: product.featuredImage?.url || '',
        type: 'image',
        price: Number(variants[0]?.price.amount || 0),
        variants: Array.from(colorSet),
        sizes: Array.from(sizeSet),
        variantNodes: variants,
      };
    }),
  }));

  // Dynamic Dials Logic
  const categoriesCount = categories.length;
  const currentCategory = categories[categoryIdx];
  const productsCount = currentCategory.products.length;
  const currentProduct = currentCategory.products[productIdx];
  const selectedVariantId = currentProduct.variantNodes?.[variantIdx]?.id;

  const triggerStatic = () => {
    if (!isOn) return;
    setStaticEffect(true);
    setTimeout(() => setStaticEffect(false), 600);
  };

  const handlePower = () => {
    if (showPrompt) setShowPrompt(false); // Dismiss prompt on power interaction
    if (isOn) {
      setIsTurningOff(true);
      setTimeout(() => {
        setIsOn(false);
        setIsTurningOff(false);
        setShowCart(false); // Reset cart on power off
        setShowGuide(false); // Reset guide on power off
      }, 600);
    } else {
      setIsOn(true);
      setStaticEffect(true);
      setTimeout(() => setStaticEffect(false), 800);
    }
  };

  const changeCategory = (direction: number) => {
    triggerStatic();
    let newIdx = categoryIdx + direction;
    if (newIdx < 0) newIdx = categoriesCount - 1;
    if (newIdx >= categoriesCount) newIdx = 0;

    setCategoryIdx(newIdx);
    setProductIdx(0);
    setVariantIdx(0);
    setSizeIdx(0);
  };

  const changeChannel = (direction: number) => {
    triggerStatic();
    let newIdx = productIdx + direction;
    if (newIdx < 0) newIdx = productsCount - 1;
    if (newIdx >= productsCount) newIdx = 0;

    setProductIdx(newIdx);
    setVariantIdx(0);
    setSizeIdx(0);
  };

  // const addToCart = (product: Product) => {
  //   const productWithVariant = {
  //     ...product,
  //     name: `${product.name} (${product.variants[variantIdx]} - ${product.sizes[sizeIdx]})`,
  //   };
  //   setCart([...cart, productWithVariant]);
  //   setJustAdded(true);

  //   const screen = document.getElementById('tv-screen') as HTMLElement | null;
  //   screen?.classList.add('brightness-150');
  //   setTimeout(() => screen?.classList.remove('brightness-150'), 200);

  //   setTimeout(() => setJustAdded(false), 1500);
  // };

  // const removeFromCart = (indexToRemove: number) => {
  //   setCart(cart.filter((_, index) => index !== indexToRemove));
  // };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4 font-sans select-none overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-gradient-to-b from-neutral-800 to-black pointer-events-none" />

      {/* Main TV Container */}
      <div className="relative w-full max-w-5xl md:aspect-[4/3] bg-[#4a3728] rounded-3xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_0_100px_rgba(0,0,0,0.5)] border-t-2 border-[#6d5440] border-b-8 border-[#2e2218] flex flex-col md:flex-row gap-4 transition-transform duration-300">
        {/* Wood Texture Overlay */}
        <div
          className="absolute inset-0 opacity-20 rounded-3xl pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 12px)`,
          }}
        />

        {/* --- LEFT SIDE: SCREEN --- */}
        <div className="relative flex-1 bg-[#111] rounded-[2rem] overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,1)] border-8 border-[#2a2a2a] ring-1 ring-white/10">
          {/* CRT Effects */}
          {isOn && <Scanlines />}
          <ScreenGlare />

          {/* Screen Content Wrapper */}
          <div
            id="tv-screen"
            className={`
              relative w-full h-full transition-all duration-300
              ${!isOn ? 'bg-[#050505]' : 'bg-[#1a1a1a]'}
              ${isTurningOff ? 'animate-turn-off' : ''}
              ${isOn && !isTurningOff ? 'animate-turn-on' : ''}
            `}
          >
            {/* Off State Center Dot */}
            {!isOn && !isTurningOff && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-1 h-1 bg-white/20 rounded-full opacity-50 blur-[1px]" />
              </div>
            )}

            {/* Active Content */}
            {isOn && (
              <div
                className={`w-full h-full relative ${staticEffect ? 'opacity-0' : 'opacity-100'}`}
              >
                {/* Product/Guide/Cart View */}
                {staticEffect ? (
                  <NoiseEffect />
                ) : showCart ? (
                  /* Full Screen Cart View */
                  <div className="w-full h-full bg-gray-900 text-green-400 p-8 font-mono overflow-y-auto scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-gray-900 relative z-20">
                    <div className="flex justify-between border-b-2 border-green-500 mb-4 pb-2 sticky top-0 bg-gray-900 z-10">
                      <h3 className="text-2xl font-bold text-yellow-400 blink">
                        SHOPPING CART
                      </h3>
                      <button
                        onClick={() => {
                          setShowCart(false);
                          triggerStatic();
                        }}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    <div className="flex-1 space-y-4">
                      {!cart ? (
                        <div className="text-center mt-20 opacity-50 flex flex-col items-center gap-4">
                          <ShoppingCart className="w-16 h-16 opacity-20" />
                          <p>LOADING CART...</p>
                        </div>
                      ) : (
                        <Suspense
                          fallback={
                            <div className="text-center mt-20 opacity-50 flex flex-col items-center gap-4">
                              <ShoppingCart className="w-16 h-16 opacity-20" />
                              <p>LOADING CART...</p>
                            </div>
                          }
                        >
                          <Await resolve={cart}>
                            {(resolvedCart) => {
                              console.log('response', resolvedCart.lines);
                              if (
                                !resolvedCart ||
                                resolvedCart.totalQuantity === 0
                              ) {
                                return (
                                  <div className="text-center mt-20 opacity-50 flex flex-col items-center gap-4">
                                    <ShoppingCart className="w-16 h-16 opacity-20" />
                                    <p>NO ITEMS INSERTED</p>
                                  </div>
                                );
                              }

                              return resolvedCart.lines.nodes.map((line) => (
                                <div
                                  key={line.id}
                                  className="flex justify-between items-center
                                    border-b border-green-800
                                    pb-2 px-2
                                    hover:bg-gray-800/50
                                    transition-colors"
                                >
                                  <div className="flex flex-col">
                                    <span className="text-sm md:text-base font-bold text-green-300">
                                      {line.merchandise.product.title}
                                      {line.merchandise.title !==
                                        'Default Title' && (
                                        <> ({line.merchandise.title})</>
                                      )}
                                    </span>

                                    <span className="text-xs text-green-600 font-mono uppercase">
                                      {line.merchandise.id}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-4">
                                    <span className="font-bold text-yellow-400">
                                      $
                                      {Number(
                                        line.cost.totalAmount.amount,
                                      ).toFixed(2)}
                                    </span>

                                    <CartForm
                                      route="/cart"
                                      action={CartForm.ACTIONS.LinesRemove}
                                      inputs={{lineIds: [line.id]}}
                                    >
                                      {(fetcher) => (
                                        <button
                                          type="submit"
                                          disabled={fetcher.state !== 'idle'}
                                          className="text-red-600 hover:text-red-500 hover:bg-red-900/30 rounded p-1 transition-colors"
                                          title="Remove item"
                                        >
                                          <X size={18} />
                                        </button>
                                      )}
                                    </CartForm>
                                  </div>
                                </div>
                              ));
                            }}
                          </Await>
                        </Suspense>
                      )}
                    </div>

                    {cart && cart.totalQuantity > 0 && (
                      <div className="mt-8 pt-4 border-t-2 border-green-800 flex flex-col gap-4 sticky bottom-0 bg-gray-900 pb-4">
                        <div className="flex justify-between items-center text-xl font-bold">
                          <span className="text-green-600">TOTAL AMOUNT</span>
                          <span className="text-yellow-400">
                            ${cart.cost.totalAmount.amount}
                          </span>
                        </div>

                        <a
                          href={cart.checkoutUrl}
                          className="w-full bg-green-700 text-black font-bold px-4 py-3 hover:bg-green-600 uppercase tracking-widest
                 shadow-[0_4px_0_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-none transition-all
                 text-center"
                        >
                          PROCEED TO CHECKOUT
                        </a>
                      </div>
                    )}
                  </div>
                ) : showGuide ? (
                  /* Channel Guide View (Teletext Style) */
                  <div className="w-full h-full bg-blue-900/95 text-green-400 p-8 font-mono overflow-y-auto scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-blue-900">
                    <div className="flex justify-between border-b-2 border-green-500 mb-4 pb-2 sticky top-0 bg-blue-900 z-10">
                      <h2 className="text-2xl font-bold blink">TV GUIDE</h2>
                      <span>{new Date().toLocaleTimeString()}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
                      {categories.map((cat, cIdx) => (
                        <div
                          key={cat.id}
                          className="border border-green-800 p-2 text-xs md:text-sm"
                        >
                          <div className="bg-green-900 text-black px-2 mb-2 font-bold uppercase">
                            {cat.name}
                          </div>
                          {cat.products.map((prod, pIdx) => (
                            <div
                              key={prod.id}
                              onClick={() => {
                                setCategoryIdx(cIdx);
                                setProductIdx(pIdx);
                                setVariantIdx(0);
                                setSizeIdx(0);
                                setShowGuide(false);
                                triggerStatic();
                              }}
                              className="flex justify-between hover:bg-green-800 hover:text-black cursor-pointer px-1 py-0.5"
                            >
                              <span className="truncate mr-2">
                                {cIdx + 1}-{pIdx + 1} {prod.name}
                              </span>
                              <span className="whitespace-nowrap">
                                ${prod.price}
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Main Product View */
                  <div className="w-full h-full relative group">
                    <img
                      src={currentProduct.image}
                      alt={currentProduct.name}
                      className="w-full h-full object-cover opacity-90 contrast-125 saturate-50"
                    />

                    {/* On-Screen Display (OSD) */}
                    <div className="absolute top-8 left-8 text-green-400 font-mono text-xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] tracking-wider">
                      <div className="bg-black/40 px-2 rounded backdrop-blur-sm mb-1 inline-block text-sm md:text-base">
                        CH {categoryIdx + 1}-{productIdx + 1}
                      </div>
                      <div className="text-xs md:text-sm opacity-80 bg-black/40 px-2 rounded inline-block ml-2">
                        {currentCategory.name}
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 text-white font-mono">
                      <div className="flex justify-between items-end mb-1">
                        <h1 className="text-xl md:text-2xl font-bold text-yellow-400 drop-shadow-md">
                          {currentProduct.name}
                        </h1>
                        <span className="text-lg md:text-xl text-green-400 font-bold">
                          ${currentProduct.price.toFixed(2)}
                        </span>
                      </div>

                      {/* Interactive Controls Row */}
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        {/* Variants (Clickable Buttons) */}
                        <div className="flex gap-2 text-[10px] md:text-xs font-bold text-green-300">
                          {currentProduct.variants.map((v, i) => (
                            <button
                              key={i}
                              onClick={() => setVariantIdx(i)}
                              className={`
                                  px-1.5 py-0.5 border rounded uppercase shadow-sm transition-all duration-200 active:scale-95
                                  ${
                                    i === variantIdx
                                      ? 'bg-yellow-400 text-black border-yellow-500'
                                      : 'bg-green-900/60 border-green-700/50 hover:bg-green-800 hover:text-white'
                                  }
                              `}
                            >
                              {v}
                            </button>
                          ))}
                        </div>

                        {/* Size Dropdown */}
                        <div className="relative">
                          <select
                            value={sizeIdx}
                            onChange={(e) =>
                              setSizeIdx(parseInt(e.target.value))
                            }
                            className="appearance-none bg-green-900/60 border border-green-700/50 text-green-300 text-[10px] md:text-xs font-bold rounded py-0.5 pl-2 pr-6 focus:outline-none focus:border-yellow-500 uppercase"
                          >
                            {currentProduct.sizes.map((s, i) => (
                              <option key={i} value={i}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-green-300 pointer-events-none" />
                        </div>
                      </div>

                      <p className="text-gray-300 max-w-lg text-xs md:text-sm leading-snug drop-shadow-sm mb-3 line-clamp-2 md:line-clamp-none opacity-90">
                        {currentProduct.description}
                      </p>
                      {selectedVariantId && (
                        <CartForm
                          route="/cart"
                          action={CartForm.ACTIONS.LinesAdd}
                          inputs={{
                            lines: [
                              {
                                merchandiseId: selectedVariantId,
                                quantity: 1,
                              },
                            ],
                          }}
                        >
                          {(fetcher) => {
                            const isAdding = fetcher.state !== 'idle';

                            return (
                              <button
                                type="submit"
                                disabled={isAdding}
                                className={`
            px-4 py-1.5 rounded-sm font-bold uppercase tracking-widest
            border-b-4 active:border-b-0 active:translate-y-1
            transition-all shadow-[0_4px_10px_rgba(0,0,0,0.5)]
            text-xs md:text-sm
            ${
              isAdding
                ? 'bg-green-600 border-green-800 text-white cursor-default'
                : 'bg-red-600 hover:bg-red-500 border-red-800 text-white'
            }
          `}
                              >
                                {isAdding ? 'ADDING...' : 'ORDER NOW'}
                              </button>
                            );
                          }}
                        </CartForm>
                      )}
                    </div>
                  </div>
                )}

                {/* Static Layer */}
                <div
                  className={`absolute inset-0 pointer-events-none transition-opacity duration-200 ${staticEffect ? 'opacity-100' : 'opacity-0'}`}
                >
                  <NoiseEffect />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- RIGHT SIDE: CONTROL PANEL --- */}
        <div className="w-full md:w-48 bg-[#d1d1d1] rounded-r-2xl rounded-l-2xl md:rounded-l-none p-6 flex flex-col items-center gap-4 relative border-l-2 border-white/20 shadow-[inset_10px_0_20px_rgba(0,0,0,0.1)]">
          {/* Branding */}
          <div className="w-full flex items-center justify-center gap-1 opacity-80">
            <div className="w-3 h-3 bg-red-600 rounded-full border-2 border-gray-400" />
            <div className="w-3 h-3 bg-yellow-400 rounded-full border-2 border-gray-400" />
            <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-gray-400" />
            <span className="font-sans font-black text-gray-700 ml-2 tracking-tighter">
              DEERICKY<span className="font-light">VIS</span>
            </span>
          </div>

          {/* Dial 1: Category */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-black tracking-widest text-gray-500 uppercase">
              CATEGORY
            </span>
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 shadow-[0_4px_10px_rgba(0,0,0,0.3),inset_0_2px_5px_rgba(255,255,255,0.8)] flex items-center justify-center">
              <div
                className="w-16 h-16 rounded-full bg-neutral-800 relative shadow-[inset_0_2px_5px_rgba(0,0,0,1)] transition-transform duration-500 ease-out cursor-grab active:cursor-grabbing"
                style={{
                  transform: `rotate(${categoryIdx * (360 / categoriesCount)}deg)`,
                }}
                onClick={() => changeCategory(1)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  changeCategory(-1);
                }}
              >
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-6 bg-white rounded-full shadow-[0_0_5px_white]" />
              </div>
              {/* Ticks Dynamic */}
              {Array.from({length: categoriesCount}).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-0.5 h-1 bg-neutral-700/60 rounded-full"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${i * (360 / categoriesCount)}deg) translateY(-36px)`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Dial 2: Channel/Product */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-black tracking-widest text-gray-500 uppercase">
              CHANNEL
            </span>
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 shadow-[0_4px_10px_rgba(0,0,0,0.3),inset_0_2px_5px_rgba(255,255,255,0.8)] flex items-center justify-center">
              <div
                className="w-16 h-16 rounded-full bg-neutral-800 relative shadow-[inset_0_2px_5px_rgba(0,0,0,1)] transition-transform duration-500 ease-out cursor-grab active:cursor-grabbing"
                style={{
                  transform: `rotate(${productIdx * (360 / productsCount)}deg)`,
                }}
                onClick={() => changeChannel(1)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  changeChannel(-1);
                }}
              >
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-6 bg-red-600 rounded-full shadow-[0_0_5px_rgba(220,38,38,0.8)]" />
              </div>
              {/* Visual Ticks Dynamic */}
              {Array.from({length: productsCount}).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-0.5 h-1 bg-neutral-700/60 rounded-full"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${i * (360 / productsCount)}deg) translateY(-36px)`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Vent Grills */}
          <div className="w-full flex flex-col gap-1.5 opacity-30 my-2">
            {Array.from({length: 16}).map((_, i) => (
              <div key={i} className="w-full h-1 bg-black rounded-full" />
            ))}
          </div>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-2 gap-3 w-full mt-2">
            <button
              onClick={() => {
                setShowGuide(!showGuide);
                if (!showGuide && isOn) triggerStatic();
              }}
              disabled={!isOn}
              className="group flex flex-col items-center gap-1 active:scale-95 transition-transform disabled:opacity-50"
            >
              <div className="w-full aspect-square bg-gray-800 rounded shadow-[0_4px_0_rgb(30,30,30)] group-active:shadow-none group-active:translate-y-1 flex items-center justify-center border-t border-gray-600">
                <Grid className="w-6 h-6 text-yellow-400" />
              </div>
              <span className="text-[9px] font-bold text-gray-600">GUIDE</span>
            </button>

            <button
              onClick={() => {
                setShowCart(!showCart);
                if (isOn) triggerStatic();
              }}
              disabled={!isOn}
              className="group flex flex-col items-center gap-1 active:scale-95 transition-transform disabled:opacity-50"
            >
              <div className="relative w-full aspect-square bg-gray-800 rounded shadow-[0_4px_0_rgb(30,30,30)] group-active:shadow-none group-active:translate-y-1 flex items-center justify-center border-t border-gray-600">
                <ShoppingCart className="w-6 h-6 text-blue-400" />
                {cart && cart.totalQuantity > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#d1d1d1]">
                    {cart.totalQuantity}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-bold text-gray-600">CART</span>
            </button>
          </div>

          {/* Power Section */}
          <div className="mt-auto w-full pt-4 border-t border-gray-400 flex flex-col items-center relative">
            {/* First Time User Prompt */}
            {showPrompt && !isOn && (
              <div className="absolute top-full mt-5 w-56 z-50 animate-bounce">
                <div
                  className="bg-yellow-300 text-black p-3 rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-black relative text-xs font-bold text-center leading-snug"
                  style={{
                    fontFamily:
                      '"Comic Sans MS", "Chalkboard SE", "Marker Felt", sans-serif',
                  }}
                >
                  Turn on the TV to see{' '}
                  <span className="whitespace-nowrap">Dee and Ricky's</span>{' '}
                  latest!
                  {/* Speech Bubble Arrow */}
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-yellow-300 border-t-2 border-l-2 border-black transform rotate-45"></div>
                  {/* Dismiss Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPrompt(false);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center border-2 border-black hover:bg-red-600 hover:scale-110 transition-transform shadow-sm"
                  >
                    <X size={12} strokeWidth={3} />
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handlePower}
              className={`
                relative w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-300 active:scale-95 bg-black
                ${
                  isOn
                    ? 'border-white shadow-[0_0_25px_rgba(255,255,255,0.6),inset_0_0_15px_rgba(255,255,255,0.3)]'
                    : 'border-gray-500 shadow-[0_4px_10px_rgba(0,0,0,0.5)]'
                }
              `}
            >
              <Power
                className={`
                  w-8 h-8 transition-all duration-300
                  ${
                    isOn
                      ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,1)]'
                      : 'text-gray-500/50'
                  }
                `}
              />
            </button>
            <span className="text-xs font-black text-gray-600 mt-2 tracking-widest">
              POWER
            </span>
          </div>
        </div>

        {/* Legs / Stand */}
        <div className="absolute -bottom-4 left-12 w-16 h-8 bg-[#1a110d] rounded-b-lg -z-10" />
        <div className="absolute -bottom-4 right-12 w-16 h-8 bg-[#1a110d] rounded-b-lg -z-10" />
      </div>

      {/* CSS Animations for CRT Effects */}
      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(100%); }
        }
        .animate-scan {
          animation: scan 8s linear infinite;
        }
        @keyframes turn-on {
          0% { transform: scale(1, 0.01) translate3d(0, 0, 0); filter: brightness(30); opacity: 0; }
          40% { transform: scale(1, 0.05) translate3d(0, 0, 0); filter: brightness(30); opacity: 1; }
          70% { transform: scale(1, 1) translate3d(0, 0, 0); filter: brightness(10); opacity: 1; }
          100% { transform: scale(1, 1) translate3d(0, 0, 0); filter: brightness(1); opacity: 1; }
        }
        .animate-turn-on {
          animation: turn-on 0.4s cubic-bezier(0.23, 1.00, 0.32, 1.00) forwards;
        }
        @keyframes turn-off {
          0% { transform: scale(1, 1.3) translate3d(0, 0, 0); filter: brightness(1); opacity: 1; }
          60% { transform: scale(1, 0.001) translate3d(0, 0, 0); filter: brightness(10); }
          100% { transform: scale(0, 0.001) translate3d(0, 0, 0); filter: brightness(50); opacity: 0; }
        }
        .animate-turn-off {
          animation: turn-off 0.5s cubic-bezier(0.23, 1.00, 0.32, 1.00) forwards;
        }
        @keyframes noise {
          0%, 100% { background-position: 0 0; }
          10% { background-position: -5% -10%; }
          20% { background-position: -15% 5%; }
          30% { background-position: 7% -25%; }
          40% { background-position: 20% 25%; }
          50% { background-position: -25% 10%; }
          60% { background-position: 15% 5%; }
          70% { background-position: 0% 15%; }
          80% { background-position: 25% 35%; }
          90% { background-position: -10% 10%; }
        }
        .animate-noise {
          animation: noise 0.5s steps(10) infinite;
        }
        .blink {
          animation: blink 1s step-end infinite;
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>

      {/* External Logo */}
      <img
        src="https://drive.google.com/uc?export=view&id=1UlouoroxmiVVN_ypZSaB6380H49HZzaA"
        alt="Logo"
        className="fixed bottom-4 left-4 w-24 z-50 drop-shadow-lg opacity-80 hover:opacity-100 transition-opacity"
      />
    </div>
  );
}
