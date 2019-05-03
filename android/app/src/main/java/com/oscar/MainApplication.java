package com.rotati.oscarhq;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.imagepicker.ImagePickerPackage;
import com.reactnativedocumentpicker.ReactNativeDocumentPicker;
import com.dylanvann.fastimage.FastImageViewPackage;
import com.avishayil.rnrestart.ReactNativeRestartPackage;
import com.github.wumke.RNExitApp.RNExitAppPackage;
import io.realm.react.RealmReactPackage;
import com.AlexanderZaytsev.RNI18n.RNI18nPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.react.modules.storage.ReactDatabaseSupplier;
import com.facebook.soloader.SoLoader;

import com.reactnativenavigation.NavigationApplication;
import com.reactnativenavigation.react.NavigationReactNativeHost;
import com.reactnativenavigation.react.ReactGateway;

import com.oblador.vectoricons.VectorIconsPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends NavigationApplication {

    @Override
    protected ReactGateway createReactGateway() {
        ReactNativeHost host = new NavigationReactNativeHost(this, isDebug(), createAdditionalReactPackages()) {
            @Override
            protected String getJSMainModuleName() {
                return "index";
            }
        };
        return new ReactGateway(this, isDebug(), host);
    }

    @Override
    public boolean isDebug() {
        return BuildConfig.DEBUG;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        SoLoader.init(this, /* native exopackage */ false);
        long size = 50L * 1024L * 1024L; // 50 MB
        ReactDatabaseSupplier.getInstance(getApplicationContext()).setMaximumSize(size);
    }

    protected List<ReactPackage> getPackages() {
        return Arrays.<ReactPackage>asList(
            new RNI18nPackage(),
            new VectorIconsPackage(),
            new RealmReactPackage(),
            new RNExitAppPackage(),
            new ReactNativeRestartPackage(),
            new FastImageViewPackage(),
            new ReactNativeDocumentPicker(),
            new ImagePickerPackage()
        );
    }

    @Override
    public List<ReactPackage> createAdditionalReactPackages() {
        return getPackages();
    }
}
