import {APP_INITIALIZER, LOCALE_ID, NgModule} from '@angular/core';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {BrowserModule} from '@angular/platform-browser';
import {DatePipe, HashLocationStrategy, LocationStrategy} from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AppRoutingModule} from './app-routing.module';

import {AccordionModule} from 'primeng/accordion';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {AvatarModule} from 'primeng/avatar';
import {AvatarGroupModule} from 'primeng/avatargroup';
import {BadgeModule} from 'primeng/badge';
import {BreadcrumbModule} from 'primeng/breadcrumb';
import {ButtonModule} from 'primeng/button';
import {CalendarModule} from 'primeng/calendar';
import {CardModule} from 'primeng/card';
import {CarouselModule} from 'primeng/carousel';
import {CascadeSelectModule} from 'primeng/cascadeselect';
import {ChartModule} from 'primeng/chart';
import {CheckboxModule} from 'primeng/checkbox';
import {ChipModule} from 'primeng/chip';
import {ChipsModule} from 'primeng/chips';
import {CodeHighlighterModule} from 'primeng/codehighlighter';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {DialogModule} from 'primeng/dialog';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import {ColorPickerModule} from 'primeng/colorpicker';
import {ContextMenuModule} from 'primeng/contextmenu';
import {DataViewModule} from 'primeng/dataview';

import {DividerModule} from 'primeng/divider';
import {DropdownModule} from 'primeng/dropdown';
import {FieldsetModule} from 'primeng/fieldset';
import {FileUploadModule} from 'primeng/fileupload';
import {FullCalendarModule} from '@fullcalendar/angular';
import {GalleriaModule} from 'primeng/galleria';
import {ImageModule} from 'primeng/image';
import {InplaceModule} from 'primeng/inplace';
import {InputNumberModule} from 'primeng/inputnumber';
import {InputMaskModule} from 'primeng/inputmask';
import {InputSwitchModule} from 'primeng/inputswitch';
import {InputTextModule} from 'primeng/inputtext';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {KnobModule} from 'primeng/knob';
import {LightboxModule} from 'primeng/lightbox';
import {ListboxModule} from 'primeng/listbox';
import {MegaMenuModule} from 'primeng/megamenu';
import {MenuModule} from 'primeng/menu';
import {MenubarModule} from 'primeng/menubar';
import {MessagesModule} from 'primeng/messages';
import {MessageModule} from 'primeng/message';
import {MultiSelectModule} from 'primeng/multiselect';
import {OrderListModule} from 'primeng/orderlist';
import {OrganizationChartModule} from 'primeng/organizationchart';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {PaginatorModule} from 'primeng/paginator';
import {PanelModule} from 'primeng/panel';
import {PanelMenuModule} from 'primeng/panelmenu';
import {PasswordModule} from 'primeng/password';
import {PickListModule} from 'primeng/picklist';
import {ProgressBarModule} from 'primeng/progressbar';
import {RadioButtonModule} from 'primeng/radiobutton';
import {RatingModule} from 'primeng/rating';
import {RippleModule} from 'primeng/ripple';
import {ScrollPanelModule} from 'primeng/scrollpanel';
import {ScrollTopModule} from 'primeng/scrolltop';
import {SelectButtonModule} from 'primeng/selectbutton';
import {SidebarModule} from 'primeng/sidebar';
import {SkeletonModule} from 'primeng/skeleton';
import {SlideMenuModule} from 'primeng/slidemenu';
import {SliderModule} from 'primeng/slider';
import {SplitButtonModule} from 'primeng/splitbutton';
import {SplitterModule} from 'primeng/splitter';
import {StepsModule} from 'primeng/steps';
import {TabMenuModule} from 'primeng/tabmenu';
import {TableModule} from 'primeng/table';
import {TabViewModule} from 'primeng/tabview';
import {TagModule} from 'primeng/tag';
import {TerminalModule} from 'primeng/terminal';
import {TieredMenuModule} from 'primeng/tieredmenu';
import {TimelineModule} from 'primeng/timeline';
import {ToastModule} from 'primeng/toast';
import {ToggleButtonModule} from 'primeng/togglebutton';
import {ToolbarModule} from 'primeng/toolbar';
import {TooltipModule} from 'primeng/tooltip';
import {TreeModule} from 'primeng/tree';
import {TreeTableModule} from 'primeng/treetable';
import {VirtualScrollerModule} from 'primeng/virtualscroller';

import {AppComponent} from './app.component';
import {AppMainComponent} from './app.main.component';
import {AppConfigComponent} from './app.config.component';
import {AppMenuComponent} from './app.menu.component';
import {AppMenuitemComponent} from './app.menuitem.component';

import {MenuService} from './app.menu.service';

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

import {NgxPrintModule} from 'ngx-print';
registerLocaleData(localeFr, 'fr');
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { AppTopBarComponent } from './app.topbar.component';
import { TestappComponent } from './pages/components/testapp/testapp.component';
import {ConfirmationService, MessageService} from 'primeng/api';
import { AuthComponent } from './pages/components/auth/auth.component';
import { ConsultationsAttenteComponent } from './pages/components/medecin/consultations-attente/consultations-attente.component';
import { PrescriptionsComponent } from './pages/components/medecin/prescriptions/prescriptions.component';
import { InterpretationResultatsComponent } from './pages/components/medecin/interpretation-resultats/interpretation-resultats.component';
import { PrescriptionsAttenteComponent } from './pages/components/pharmacie/prescriptions-attente/prescriptions-attente.component';
import { DelivranceComponent } from './pages/components/pharmacie/delivrance/delivrance.component';
import { ExamensAttenteComponent } from './pages/components/laboratoire/examens-attente/examens-attente.component';
import { RealisationComponent } from './pages/components/laboratoire/realisation/realisation.component';
import { SaisieResultatsComponent } from './pages/components/laboratoire/saisie-resultats/saisie-resultats.component';
import { DashboardComponent } from './pages/components/uab/dashboard/dashboard.component';
import { DossiersComponent } from './pages/components/uab/dossiers/dossiers.component';
import { ValidationComponent } from './pages/components/uab/validation/validation.component';
import { MedicamentsComponent } from './pages/components/parametres/medicaments/medicaments.component';
import { ExamensComponent } from './pages/components/parametres/examens/examens.component';
import { TauxCouvertureComponent } from './pages/components/parametres/taux-couverture/taux-couverture.component';
import { LoginComponent } from './pages/components/login/login.component';
import {
    NouvelleConsultationComponent
} from './pages/components/caisse-hopital/nouvelle-consultation/nouvelle-consultation.component';
import { StructuresComponent } from './pages/components/structures/structures.component';
import { CaisseLaboratoireComponent } from './pages/components/laboratoire/caisse-laboratoire/caisse-laboratoire.component';
import { StructureDashboardComponent } from './pages/components/structure-dashboard/structure-dashboard.component';
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {UtilisateursComponent} from "./pages/components/uab/utilisateurs/utilisateurs.component";
import {AuthInterceptor} from "./pages/core/interceptors/interceptors.interceptor";
import { FooterComponent } from './footer/footer.component';
import { PlafonnementComponent } from './pages/components/uab/plafonnement/plafonnement.component';
import { ImportMedicamentsComponent } from './pages/components/uab/import-medicaments/import-medicaments.component';
import { ValidationExamensComponent } from './pages/components/uab/validation-examens/validation-examens.component';
import { DemandesAttenteComponent } from './pages/components/medecin/demandes-attente/demandes-attente.component';

FullCalendarModule.registerPlugins([
    dayGridPlugin,
    timeGridPlugin,
    interactionPlugin
]);

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule,
        AccordionModule,
        AutoCompleteModule,
        AvatarModule,
        AvatarGroupModule,
        BadgeModule,
        BreadcrumbModule,
        ButtonModule,
        CalendarModule,
        CardModule,
        CarouselModule,
        CascadeSelectModule,
        ChartModule,
        CheckboxModule,
        ChipModule,
        ChipsModule,
        CodeHighlighterModule,
        ConfirmDialogModule,
        ConfirmPopupModule,
        ColorPickerModule,
        ContextMenuModule,
        DataViewModule,
        DialogModule,
        DividerModule,
        DropdownModule,
        FieldsetModule,
        FileUploadModule,
        FullCalendarModule,
        GalleriaModule,
        ImageModule,
        InplaceModule,
        InputNumberModule,
        InputMaskModule,
        InputSwitchModule,
        InputTextModule,
        InputTextareaModule,
        KnobModule,
        LightboxModule,
        ListboxModule,
        MegaMenuModule,
        MenuModule,
        MenubarModule,
        MessageModule,
        MessagesModule,
        MultiSelectModule,
        OrderListModule,
        OrganizationChartModule,
        OverlayPanelModule,
        PaginatorModule,
        PanelModule,
        PanelMenuModule,
        PasswordModule,
        PickListModule,
        ProgressBarModule,
        RadioButtonModule,
        RatingModule,
        RippleModule,
        ScrollPanelModule,
        ScrollTopModule,
        SelectButtonModule,
        SidebarModule,
        SkeletonModule,
        SlideMenuModule,
        SliderModule,
        SplitButtonModule,
        SplitterModule,
        StepsModule,
        TableModule,
        TabMenuModule,
        TabViewModule,
        TagModule,
        TerminalModule,
        TimelineModule,
        TieredMenuModule,
        ToastModule,
        ToggleButtonModule,
        ToolbarModule,
        TooltipModule,
        TreeModule,
        TreeTableModule,
        VirtualScrollerModule,
        NgxPrintModule,
        ReactiveFormsModule,
        ProgressSpinnerModule,
    ],
    declarations: [
        AppComponent,
        AppMainComponent,
        AppTopBarComponent,
        AppConfigComponent,
        AppMenuComponent,
        AppMenuitemComponent,
        TestappComponent,
        AuthComponent,
        NouvelleConsultationComponent,
        ConsultationsAttenteComponent,
        PrescriptionsComponent,
        InterpretationResultatsComponent,
        PrescriptionsAttenteComponent,
        DelivranceComponent,
        ExamensAttenteComponent,
        RealisationComponent,
        SaisieResultatsComponent,
        DashboardComponent,
        DossiersComponent,
        ValidationComponent,
        MedicamentsComponent,
        ExamensComponent,
        TauxCouvertureComponent,
        LoginComponent,
        StructuresComponent,
        UtilisateursComponent,
        CaisseLaboratoireComponent,
        StructureDashboardComponent,
        FooterComponent,
        PlafonnementComponent,
        ImportMedicamentsComponent,
        ValidationExamensComponent,
        DemandesAttenteComponent,
    ],
    providers: [
        {provide: LocationStrategy, useClass: HashLocationStrategy},
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        MessageService,
        MenuService,
        ConfirmationService,
        DatePipe,
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
