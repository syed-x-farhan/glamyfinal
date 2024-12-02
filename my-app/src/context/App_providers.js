import React from 'react';
import { CartProvider } from './cart_context';
import { AuthProvider } from './sign-in_sign-up_context'; 
import SaveProvider from './save_context';
import { SearchProvider } from './search_context';
import { HomeProvider } from './home_context';
import { CheckoutProvider } from './checkout_context'; 

const AppProviders = ({ children }) => {
    return (
        <CartProvider>
            <AuthProvider>
                <SaveProvider>
                    <SearchProvider>
                        <HomeProvider>
                            <CheckoutProvider> 
                                {children}
                            </CheckoutProvider>
                        </HomeProvider>
                    </SearchProvider>
                </SaveProvider>
            </AuthProvider>
        </CartProvider>
    );
};

export default AppProviders;