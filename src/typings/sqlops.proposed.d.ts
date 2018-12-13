/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// This is the place for API experiments and proposal.

import * as core from 'sqlops';
import * as vscode from 'vscode';

declare module 'sqlops' {

	/**
	 * Supports defining a model that can be instantiated as a view in the UI
	 * @export
	 * @interface ModelBuilder
	 */
	export interface ModelBuilder {
		navContainer(): ContainerBuilder<NavContainer, any, any>;
		divContainer(): DivBuilder;
		flexContainer(): FlexBuilder;
		dom(): ComponentBuilder<DomComponent>
		card(): ComponentBuilder<CardComponent>;
		inputBox(): ComponentBuilder<InputBoxComponent>;
		checkBox(): ComponentBuilder<CheckBoxComponent>;
		radioButton(): ComponentBuilder<RadioButtonComponent>;
		webView(): ComponentBuilder<WebViewComponent>;
		editor(): ComponentBuilder<EditorComponent>;
		text(): ComponentBuilder<TextComponent>;
		button(): ComponentBuilder<ButtonComponent>;
		dropDown(): ComponentBuilder<DropDownComponent>;
		tree<T>(): ComponentBuilder<TreeComponent<T>>;
		listBox(): ComponentBuilder<ListBoxComponent>;
		table(): ComponentBuilder<TableComponent>;
		declarativeTable(): ComponentBuilder<DeclarativeTableComponent>;
		dashboardWidget(widgetId: string): ComponentBuilder<DashboardWidgetComponent>;
		dashboardWebview(webviewId: string): ComponentBuilder<DashboardWebviewComponent>;
		formContainer(): FormBuilder;
		groupContainer(): GroupBuilder;
		toolbarContainer(): ToolbarBuilder;
		loadingComponent(): LoadingComponentBuilder;
		fileBrowserTree(): ComponentBuilder<FileBrowserTreeComponent>;
	}

	export interface TreeComponentDataProvider<T> extends vscode.TreeDataProvider<T> {
		getTreeItem(element: T): TreeComponentItem | Thenable<TreeComponentItem>;
	}

	export interface NodeCheckedEventParameters<T> {
		element: T,
		checked: boolean
	}

	export interface TreeComponentView<T> extends vscode.Disposable {
		onNodeCheckedChanged: vscode.Event<NodeCheckedEventParameters<T>>;
		onDidChangeSelection: vscode.Event<vscode.TreeViewSelectionChangeEvent<T>>;
	}

	export class TreeComponentItem extends vscode.TreeItem {
		checked?: boolean;
		enabled?: boolean;
	}

	export interface ComponentBuilder<T extends Component> {
		component(): T;
		withProperties<U>(properties: U): ComponentBuilder<T>;
		withValidation(validation: (component: T) => boolean): ComponentBuilder<T>;
	}
	export interface ContainerBuilder<T extends Component, TLayout, TItemLayout> extends ComponentBuilder<T> {
		withLayout(layout: TLayout): ContainerBuilder<T, TLayout, TItemLayout>;
		withItems(components: Array<Component>, itemLayout?: TItemLayout): ContainerBuilder<T, TLayout, TItemLayout>;
	}

	export interface FlexBuilder extends ContainerBuilder<FlexContainer, FlexLayout, FlexItemLayout> {

	}

	export interface DivBuilder extends ContainerBuilder<DivContainer, DivLayout, DivItemLayout> {

	}

	export interface GroupBuilder extends ContainerBuilder<GroupContainer, GroupLayout, GroupItemLayout> {
	}

	export interface ToolbarBuilder extends ContainerBuilder<ToolbarContainer, ToolbarLayout, any> {
		withToolbarItems(components: ToolbarComponent[]): ContainerBuilder<ToolbarContainer, ToolbarLayout, any>;

		/**
		 * Creates a collection of child components and adds them all to this container
		 *
		 * @param toolbarComponents the definitions
		 */
		addToolbarItems(toolbarComponents: Array<ToolbarComponent>): void;

		/**
		 * Creates a child component and adds it to this container.
		 *
		 * @param toolbarComponent the component to be added
		 */
		addToolbarItem(toolbarComponent: ToolbarComponent): void;
	}

	export interface LoadingComponentBuilder extends ComponentBuilder<LoadingComponent> {
		/**
		 * Set the component wrapped by the LoadingComponent
		 * @param component The component to wrap
		 */
		withItem(component: Component): LoadingComponentBuilder;
	}

	export interface FormBuilder extends ContainerBuilder<FormContainer, FormLayout, FormItemLayout> {
		withFormItems(components: (FormComponent | FormComponentGroup)[], itemLayout?: FormItemLayout): FormBuilder;

		/**
		 * Creates a collection of child components and adds them all to this container
		 *
		 * @param formComponents the definitions
		 * @param {*} [itemLayout] Optional layout for the child items
		 */
		addFormItems(formComponents: Array<FormComponent | FormComponentGroup>, itemLayout?: FormItemLayout): void;

		/**
		 * Creates a child component and adds it to this container.
		 *
		 * @param formComponent the component to be added
		 * @param {*} [itemLayout] Optional layout for this child item
		 */
		addFormItem(formComponent: FormComponent | FormComponentGroup, itemLayout?: FormItemLayout): void;

		/**
		 * Inserts a from component in a given position in the form. Returns error given invalid index
		 * @param formComponent Form component
		 * @param index index to insert the component to
		 * @param itemLayout Item Layout
		 */
		insertFormItem(formComponent: FormComponent | FormComponentGroup, index?: number, itemLayout?: FormItemLayout): any;

		/**
		 * Removes a from item from the from
		 * @param formComponent
		 */
		removeFormItem(formComponent: FormComponent | FormComponentGroup): boolean;
	}

	export interface Component {
		readonly id: string;

		/**
		 * Sends any updated properties of the component to the UI
		 *
		 * @returns {Thenable<void>} Thenable that completes once the update
		 * has been applied in the UI
		 * @memberof Component
		 */
		updateProperties(properties: { [key: string]: any }): Thenable<void>;

		/**
		 * Sends an updated property of the component to the UI
		 *
		 * @returns {Thenable<void>} Thenable that completes once the update
		 * has been applied in the UI
		 * @memberof Component
		 */
		updateProperty(key: string, value: any): Thenable<void>;

		enabled: boolean;
		/**
		 * Event fired to notify that the component's validity has changed
		 */
		readonly onValidityChanged: vscode.Event<boolean>;

		/**
		 * Whether the component is valid or not
		 */
		readonly valid: boolean;

		/**
		 * Run the component's validations
		 */
		validate(): Thenable<boolean>;
	}

	export interface FormComponent {
		component: Component;
		title: string;
		actions?: Component[];
		required?: boolean;
	}

	/**
	 * Used to create a group of components in a form layout
	 */
	export interface FormComponentGroup {
		/**
		 * The form components to display in the group along with optional layouts for each item
		 */
		components: (FormComponent & { layout?: FormItemLayout })[];

		/**
		 * The title of the group, displayed above its components
		 */
		title: string;
	}

	export interface ToolbarComponent {
		component: Component;
		title?: string;
	}

	/**
	 * A component that contains other components
	 */
	export interface Container<TLayout, TItemLayout> extends Component {
		/**
		 * A copy of the child items array. This cannot be added to directly -
		 * components must be created using the create methods instead
		 */
		readonly items: Component[];

		/**
		 * Removes all child items from this container
		 */
		clearItems(): void;
		/**
		 * Creates a collection of child components and adds them all to this container
		 *
		 * @param itemConfigs the definitions
		 * @param {*} [itemLayout] Optional layout for the child items
		 */
		addItems(itemConfigs: Array<Component>, itemLayout?: TItemLayout): void;

		/**
		 * Creates a child component and adds it to this container.
		 * Adding component to multiple containers is not supported
		 *
		 * @param {Component} component the component to be added
		 * @param {*} [itemLayout] Optional layout for this child item
		 */
		addItem(component: Component, itemLayout?: TItemLayout): void;

		/**
		 * Creates a child component and inserts it to this container. Returns error given invalid index
		 * Adding component to multiple containers is not supported
		 * @param component the component to be added
		 * @param index the index to insert the component to
		 * @param {*} [itemLayout] Optional layout for this child item
		 */
		insertItem(component: Component, index: number, itemLayout?: TItemLayout): void;

		/**
		 *
		 * @param component Removes a component from this container
		 */
		removeItem(component: Component): boolean;

		/**
		 * Defines the layout for this container
		 *
		 * @param {TLayout} layout object
		 */
		setLayout(layout: TLayout): void;
	}

	export interface NavContainer extends Container<any, any> {

	}

	/**
	 * The config for a FlexBox-based container. This supports easy
	 * addition of content to a container with a flexible layout
	 * and use of space.
	 */
	export interface FlexLayout {
		/**
		 * Matches the flex-flow CSS property and its available values.
		 * To layout as a vertical view use "column", and for horizontal
		 * use "row".
		 */
		flexFlow?: string;
		/**
		 * Matches the justify-content CSS property.
		 */
		justifyContent?: string;
		/**
		 * Matches the align-items CSS property.
		 */
		alignItems?: string;
		/**
		 * Matches the align-content CSS property.
		 */
		alignContent?: string;

		/**
		 * Container Height
		 */
		height?: number | string;

		/**
		 * Container Width
		 */
		width?: number | string;

		/**
		 *
		 */
		textAlign?: string;

		/**
		 * The position CSS property. Empty by default.
		 * This is particularly useful if laying out components inside a FlexContainer and
		 * the size of the component is meant to be a fixed size. In this case the position must be
		 * set to 'absolute', with the parent FlexContainer having 'relative' position.
		 * Without this the component will fail to correctly size itself.
		 */
		position?: string;
	}

	export interface FlexItemLayout {
		/**
		 * Matches the order CSS property and its available values.
		 */
		order?: number;
		/**
		 * Matches the flex CSS property and its available values.
		 * Default is "1 1 auto".
		 */
		flex?: string;
		/**
		 * Matches the CSS style key and its available values.
		 */
		CSSStyles?: { [key: string]: string };
	}

	export interface FormItemLayout {
		horizontal?: boolean;
		componentWidth?: number | string;
		componentHeight?: number | string;
		titleFontSize?: number | string;
		info?: string;
	}

	export interface FormLayout {
		width?: number | string;
		height?: number | string;
		padding?: string;
	}

	export interface GroupLayout {
		width?: number | string;
		header?: string;
	}

	export interface GroupItemLayout {
	}

	export interface DivLayout {
		/**
		 * Container Height
		 */
		height?: number | string;

		/**
		 * Container Width
		 */
		width?: number | string;
	}

	export interface DivItemLayout {
		/**
		 * Matches the order CSS property and its available values.
		 */
		order?: number;

		/**
		 * Matches the CSS style key and its available values.
		 */
		CSSStyles?: { [key: string]: string };
	}

	export interface DivContainer extends Container<DivLayout, DivItemLayout>, DivContainerProperties {
	}

	export interface FlexContainer extends Container<FlexLayout, FlexItemLayout> {
	}

	export interface FormContainer extends Container<FormLayout, FormItemLayout> {
	}

	export interface GroupContainer extends Container<GroupLayout, GroupItemLayout> {
	}


	export enum Orientation {
		Horizontal = 'horizontal',
		Vertical = 'vertial'
	}

	export interface ToolbarLayout {
		orientation: Orientation;
	}
	export interface ToolbarContainer extends Container<ToolbarLayout, any> {
	}

	/**
	 * Describes an action to be shown in the UI, with a user-readable label
	 * and a callback to execute the action
	 */
	export interface ActionDescriptor {
		/**
		 * User-visible label to display
		 */
		label: string;
		/**
		 * Name of the clickable action. If not defined then no action will be shown
		 */
		actionTitle?: string;
		/**
		 * Data sent on callback being run.
		 */
		callbackData?: any;
	}

	/**
	 * Defines status indicators that can be shown to the user as part of
	 * components such as the Card UI
	 */
	export enum StatusIndicator {
		None = 0,
		Ok = 1,
		Warning = 2,
		Error = 3
	}

	export enum CardType {
		VerticalButton = 'VerticalButton',
		Details = 'Details'
	}

	/**
	 * Properties representing the card component, can be used
	 * when using ModelBuilder to create the component
	 */
	export interface CardProperties extends ComponentWithIcon {
		label: string;
		value?: string;
		actions?: ActionDescriptor[];
		status?: StatusIndicator;

		/**
		 * Returns true if the card is selected
		 */
		selected?: boolean;

		/**
		 * Card Type, default: Details
		 */
		cardType?: CardType;
	}

	export type InputBoxInputType = 'color' | 'date' | 'datetime-local' | 'email' | 'month' | 'number' | 'password' | 'range' | 'search' | 'text' | 'time' | 'url' | 'week';

	export interface ComponentProperties {
		height?: number | string;
		width?: number | string;
		/**
		 * The position CSS property. Empty by default.
		 * This is particularly useful if laying out components inside a FlexContainer and
		 * the size of the component is meant to be a fixed size. In this case the position must be
		 * set to 'absolute', with the parent FlexContainer having 'relative' position.
		 * Without this the component will fail to correctly size itself
		 */
		position?: string;
		/**
		 * Matches the CSS style key and its available values.
		 */
		CSSStyles?: { [key: string]: string };
	}

	export interface ComponentWithIcon {
		iconPath?: string | vscode.Uri | { light: string | vscode.Uri; dark: string | vscode.Uri };
		iconHeight?: number | string;
		iconWidth?: number | string;
	}

	export interface InputBoxProperties extends ComponentProperties {
		value?: string;
		ariaLabel?: string;
		placeHolder?: string;
		inputType?: InputBoxInputType;
		required?: boolean;
		multiline?: boolean;
		rows?: number;
		columns?: number;
		min?: number;
		max?: number;
	}

	export interface TableColumn {
		value: string;
	}

	export interface TableComponentProperties extends ComponentProperties {
		data: any[][];
		columns: string[] | TableColumn[];
		fontSize?: number | string;
		selectedRows?: number[];
	}

	export interface FileBrowserTreeProperties extends ComponentProperties {
		ownerUri: string;
	}

	export interface CheckBoxProperties {
		checked?: boolean;
		label?: string;
	}

	export interface TreeProperties extends ComponentProperties {
		withCheckbox?: boolean;
	}

	export enum DeclarativeDataType {
		string = 'string',
		category = 'category',
		boolean = 'boolean',
		editableCategory = 'editableCategory'
	}

	export interface RadioButtonProperties {
		name?: string;
		label?: string;
		value?: string;
		checked?: boolean;
	}

	export interface TextComponentProperties {
		value?: string;
	}

	export interface DropDownProperties extends ComponentProperties {
		value?: string | CategoryValue;
		values?: string[] | CategoryValue[];
		editable?: boolean;
	}

	export interface DeclarativeTableColumn {
		displayName: string;
		categoryValues: CategoryValue[];
		valueType: DeclarativeDataType;
		isReadOnly: boolean;
		width: number | string;
	}

	export interface DeclarativeTableProperties {
		data: any[][];
		columns: DeclarativeTableColumn[];
	}

	export interface ListBoxProperties {
		selectedRow?: number;
		values?: string[];

	}

	export interface WebViewProperties extends ComponentProperties {
		message?: any;

		/**
		 * Contents of the webview.
		 *
		 * Should be a complete html document.
		 */
		html?: string;
		/**
		 * Content settings for the webview.
		 */
		options?: vscode.WebviewOptions;
	}

	export interface DomProperties extends ComponentProperties {
		/**
		 * Contents of the DOM component.
		 */
		html?: string;
	}

	/**
	 * Editor properties for the editor component
	 */
	export interface EditorProperties extends ComponentProperties {
		/**
		 * The content inside the text editor
		 */
		content?: string;
		/**
		 * The languge mode for this text editor. The language mode is SQL by default.
		 */
		languageMode?: string;
		/**
		 * Minimum height for editor component
		 */
		minimumHeight?: number;
	}

	export interface ButtonProperties extends ComponentProperties, ComponentWithIcon {
		label?: string;
		isFile?: boolean;
		fileContent?: string;
		title?: string;
	}

	export interface LoadingComponentProperties {
		loading?: boolean;
	}

	export interface DivContainerProperties extends ComponentProperties {
		/**
		 * Matches the overflow-y CSS property and its available values.
		 */
		overflowY?: string;

		/**
		 * Setting the scroll based on the y offset
		 * This is used when its child component is webview
		 */
		yOffsetChange?: number;
	}

	export interface CardComponent extends Component, CardProperties {
		onDidActionClick: vscode.Event<ActionDescriptor>;
		onCardSelectedChanged: vscode.Event<any>;
	}

	export interface DomComponent extends Component, DomProperties {

	}

	export interface TextComponent extends Component {
		value: string;
	}

	export interface InputBoxComponent extends Component, InputBoxProperties {
		onTextChanged: vscode.Event<any>;
	}

	export interface RadioButtonComponent extends Component, RadioButtonProperties {
		onDidClick: vscode.Event<any>;
	}

	export interface CheckBoxComponent extends Component {
		checked: boolean;
		label: string;
		onChanged: vscode.Event<any>;
	}

	export interface DropDownComponent extends Component, DropDownProperties {
		value: string | CategoryValue;
		values: string[] | CategoryValue[];
		onValueChanged: vscode.Event<any>;
	}

	export interface TableCell {
		row: number;
		column: number;
		value: any;
	}

	export interface DeclarativeTableComponent extends Component, DeclarativeTableProperties {
		onDataChanged: vscode.Event<any>;
	}

	export interface ListBoxComponent extends Component, ListBoxProperties {
		selectedRow?: number;
		values: string[];
		onRowSelected: vscode.Event<any>;
	}

	export interface TableComponent extends Component, TableComponentProperties {
		onRowSelected: vscode.Event<any>;
	}

	export interface FileBrowserTreeComponent extends Component, FileBrowserTreeProperties {
		onDidChange: vscode.Event<any>;
	}

	export interface TreeComponent<T> extends Component, TreeProperties {
		registerDataProvider<T>(dataProvider: TreeComponentDataProvider<T>): TreeComponentView<T>;
	}

	export interface WebViewComponent extends Component {
		html: string;
		message: any;
		onMessage: vscode.Event<any>;
		readonly options: vscode.WebviewOptions;
	}

	/**
	 * Editor component for displaying the text code editor
	 */
	export interface EditorComponent extends Component {
		/**
		 * The content inside the text editor
		 */
		content: string;
		/**
		 * The languge mode for this text editor. The language mode is SQL by default.
		 */
		languageMode: string;
		/**
		 * The editor Uri which will be used as a reference for VSCode Language Service.
		 * Currently this is auto-generated by the framework but can be queried after
		 * view initialization is completed
		 */
		readonly editorUri: string;
		/**
		 * An event called when the editor content is updated
		 */
		readonly onContentChanged: vscode.Event<any>;

		/**
		 * An event called when the editor is created
		 */
		readonly onEditorCreated: vscode.Event<any>;

		/**
		 * Toggle for whether the editor should be automatically resized or not
		 */
		isAutoResizable: boolean;

		/**
		 * Minimum height for editor component
		 */
		minimumHeight: number;

	}

	export interface ButtonComponent extends Component, ButtonProperties {
		/**
		 * The label for the button
		 */
		label: string;
		/**
		 * The title for the button. This title will show when it hovers
		 */
		title: string;
		/**
		 * Icon Path for the button.
		 */
		iconPath: string | vscode.Uri | { light: string | vscode.Uri; dark: string | vscode.Uri };

		/**
		 * An event called when the button is clicked
		 */
		onDidClick: vscode.Event<any>;
	}

	export interface DashboardWidgetComponent extends Component {
		widgetId: string;
	}

	export interface DashboardWebviewComponent extends Component {
		webviewId: string;
	}

	/**
	 * Component used to wrap another component that needs to be loaded, and show a loading spinner
	 * while the contained component is loading
	 */
	export interface LoadingComponent extends Component {
		/**
		 * Whether to show the loading spinner instead of the contained component. True by default
		 */
		loading: boolean;

		/**
		 * The component displayed when the loading property is false
		 */
		component: Component;
	}

	/**
	 * A view backed by a model provided by an extension.
	 * This model contains enough information to lay out the view
	 */
	export interface ModelView {
		/**
		 * Raised when the view closed.
		 */
		readonly onClosed: vscode.Event<any>;

		/**
		 * The connection info for the dashboard the webview exists on
		 */
		readonly connection: connection.Connection;

		/**
		 * The info on the server for the dashboard
		 */
		readonly serverInfo: ServerInfo;

		/**
		 * The model backing the model-based view
		 */
		readonly modelBuilder: ModelBuilder;

		/**
		 * Whether or not the model view's root component is valid
		 */
		readonly valid: boolean;

		/**
		 * Raised when the model view's valid property changes
		 */
		readonly onValidityChanged: vscode.Event<boolean>;

		/**
		 * Run the model view root component's validations
		 */
		validate(): Thenable<boolean>;

		/**
		 * Initializes the model with a root component definition.
		 * Once this has been done, the components will be laid out in the UI and
		 * can be accessed and altered as needed.
		 */
		initializeModel<T extends Component>(root: T): Thenable<void>;
	}

	export namespace ui {
		/**
		 * Register a provider for a model-view widget
		 */
		export function registerModelViewProvider(widgetId: string, handler: (view: ModelView) => void): void;
	}

	export namespace window {
		export namespace modelviewdialog {
			/**
			 * Create a dialog with the given title
			 * @param title The title of the dialog, displayed at the top
			 */
			export function createDialog(title: string): Dialog;

			/**
			 * Create a dialog tab which can be included as part of the content of a dialog
			 * @param title The title of the page, displayed on the tab to select the page
			 */
			export function createTab(title: string): DialogTab;

			/**
			 * Create a button which can be included in a dialog
			 * @param label The label of the button
			 */
			export function createButton(label: string): Button;

			/**
			 * Opens the given dialog if it is not already open
			 */
			export function openDialog(dialog: Dialog): void;

			/**
			 * Closes the given dialog if it is open
			 */
			export function closeDialog(dialog: Dialog): void;

			/**
			 * Create a wizard page with the given title, for inclusion in a wizard
			 * @param title The title of the page
			 */
			export function createWizardPage(title: string): WizardPage;

			/**
			 * Create a wizard with the given title and pages
			 * @param title The title of the wizard
			 */
			export function createWizard(title: string): Wizard;

			/**
			 * Used to control whether a message in a dialog/wizard is displayed as an error,
			 * warning, or informational message. Default is error.
			 */
			export enum MessageLevel {
				Error = 0,
				Warning = 1,
				Information = 2
			}

			/**
			 * A message shown in a dialog. If the level is not set it defaults to error.
			 */
			export type DialogMessage = {
				readonly text: string,
				readonly description?: string,
				readonly level?: MessageLevel
			};

			export interface ModelViewPanel {
				/**
				 * Register model view content for the dialog.
				 * Doesn't do anything if model view is already registered
				 */
				registerContent(handler: (view: ModelView) => Thenable<void>): void;

				/**
				 * Returns the model view content if registered. Returns undefined if model review is not registered
				 */
				readonly modelView: ModelView;

				/**
				 * Whether the panel's content is valid
				 */
				readonly valid: boolean;

				/**
				 * Fired whenever the panel's valid property changes
				 */
				readonly onValidityChanged: vscode.Event<boolean>;
			}

			// Model view dialog classes
			export interface Dialog extends ModelViewPanel {
				/**
				 * The title of the dialog
				 */
				title: string,

				/**
				 * The content of the dialog. If multiple tabs are given they will be displayed with tabs
				 * If a string is given, it should be the ID of the dialog's model view content
				 */
				content: string | DialogTab[],

				/**
				 * The ok button
				 */
				okButton: Button;

				/**
				 * The cancel button
				 */
				cancelButton: Button;

				/**
				 * Any additional buttons that should be displayed
				 */
				customButtons: Button[];

				/**
				 * Set the informational message shown in the dialog. Hidden when the message is
				 * undefined or the text is empty or undefined. The default level is error.
				 */
				message: DialogMessage;

				/**
				 * Register a callback that will be called when the user tries to click done. Only
				 * one callback can be registered at once, so each registration call will clear
				 * the previous registration.
				 * @param validator The callback that gets executed when the user tries to click
				 * done. Return true to allow the dialog to close or false to block it from closing
				 */
				registerCloseValidator(validator: () => boolean | Thenable<boolean>): void;

				/**
				 * Register an operation to run in the background when the dialog is done
				 * @param operationInfo Operation Information
				 */
				registerOperation(operationInfo: BackgroundOperationInfo): void;
			}

			export interface DialogTab extends ModelViewPanel {
				/**
				 * The title of the tab
				 */
				title: string;

				/**
				 * A string giving the ID of the tab's model view content
				 */
				content: string;
			}

			export interface Button {
				/**
				 * The label displayed on the button
				 */
				label: string;

				/**
				 * Whether the button is enabled
				 */
				enabled: boolean;

				/**
				 * Whether the button is hidden
				 */
				hidden: boolean;

				/**
				 * Raised when the button is clicked
				 */
				readonly onClick: vscode.Event<void>;
			}

			export interface WizardPageChangeInfo {
				/**
				 * The page number that the wizard changed from
				 */
				lastPage: number,

				/**
				 * The new page number or undefined if the user is closing the wizard
				 */
				newPage: number
			}

			export interface WizardPage extends ModelViewPanel {
				/**
				 * The title of the page
				 */
				title: string;

				/**
				 * A string giving the ID of the page's model view content
				 */
				content: string;

				/**
				 * Any additional buttons that should be displayed while the page is open
				 */
				customButtons: Button[];

				/**
				 * Whether the page is enabled. If the page is not enabled, the user will not be
				 * able to advance to it. Defaults to true.
				 */
				enabled: boolean;

				/**
				 * An optional description for the page. If provided it will be displayed underneath the page title.
				 */
				description: string;
			}

			export interface Wizard {
				/**
				 * The title of the wizard
				 */
				title: string;

				/**
				 * The wizard's pages. Pages can be added/removed while the dialog is open by using
				 * the addPage and removePage methods
				 */
				pages: WizardPage[];

				/**
				 * The index in the pages array of the active page, or undefined if the wizard is
				 * not currently visible
				 */
				readonly currentPage: number;

				/**
				 * The done button
				 */
				doneButton: Button;

				/**
				 * The cancel button
				 */
				cancelButton: Button;

				/**
				 * The generate script button
				 */
				generateScriptButton: Button;

				/**
				 * The next button
				 */
				nextButton: Button;

				/**
				 * The back button
				 */
				backButton: Button;

				/**
				 * Any additional buttons that should be displayed for all pages of the dialog. If
				 * buttons are needed for specific pages they can be added using the customButtons
				 * property on each page.
				 */
				customButtons: Button[];

				/**
				 * When set to false page titles and descriptions will not be displayed at the top
				 * of each wizard page. The default is true.
				 */
				displayPageTitles: boolean;

				/**
				 * Event fired when the wizard's page changes, containing information about the
				 * previous page and the new page
				 */
				onPageChanged: vscode.Event<WizardPageChangeInfo>;

				/**
				 * Add a page to the wizard at the given index
				 * @param page The page to add
				 * @param index The index in the pages array to add the page at, or undefined to
				 * add it at the end
				 */
				addPage(page: WizardPage, index?: number): Thenable<void>;

				/**
				 * Remove the page at the given index from the wizard
				 * @param index The index in the pages array to remove
				 */
				removePage(index: number): Thenable<void>;

				/**
				 * Go to the page at the given index in the pages array.
				 * @param index The index of the page to go to
				 */
				setCurrentPage(index: number): Thenable<void>;

				/**
				 * Open the wizard. Does nothing if the wizard is already open.
				 */
				open(): Thenable<void>;

				/**
				 * Close the wizard. Does nothing if the wizard is not open.
				 */
				close(): Thenable<void>;

				/**
				 * Register a callback that will be called when the user tries to navigate by
				 * changing pages or clicking done. Only one callback can be registered at once, so
				 * each registration call will clear the previous registration.
				 * @param validator The callback that gets executed when the user tries to
				 * navigate. Return true to allow the navigation to proceed, or false to
				 * cancel it.
				 */
				registerNavigationValidator(validator: (pageChangeInfo: WizardPageChangeInfo) => boolean | Thenable<boolean>): void;

				/**
				 * Set the informational message shown in the wizard. Hidden when the message is
				 * undefined or the text is empty or undefined. The default level is error.
				 */
				message: DialogMessage

				/**
				 * Register an operation to run in the background when the wizard is done
				 * @param operationInfo Operation Information
				 */
				registerOperation(operationInfo: BackgroundOperationInfo): void;
			}
		}
	}

	/**
	 * Namespace for interacting with query editor
	*/
	export namespace queryeditor {

		/**
		 * Make connection for the query editor
		 * @param {string} fileUri file URI for the query editor
		 * @param {string} connectionId connection ID
		 */
		export function connect(fileUri: string, connectionId: string): Thenable<void>;

		/**
		 * Run query if it is a query editor and it is already opened.
		 * @param {string} fileUri file URI for the query editor
		 */
		export function runQuery(fileUri: string): void;
	}

	/**
	 * Namespace for interacting with the workspace
	 */
	export namespace workspace {

		/**
		 * Create a new model view editor
		 */
		export function createModelViewEditor(title: string, options?: ModelViewEditorOptions): ModelViewEditor;

		export interface ModelViewEditor extends window.modelviewdialog.ModelViewPanel {
			/**
			 * `true` if there are unpersisted changes.
			 * This is editable to support extensions updating the dirty status.
			 */
			isDirty: boolean;

			/**
			 * Opens the editor
			 */
			openEditor(position?: vscode.ViewColumn): Thenable<void>;

			/**
			 * Registers a save handler for this editor. This will be called if [supportsSave](#ModelViewEditorOptions.supportsSave)
			 * is set to true and the editor is marked as dirty
			 */
			registerSaveHandler(handler: () => Thenable<boolean>): any;
		}
	}

	export interface ModelViewEditorOptions {
		/**
		 * Should the model view editor's context be kept around even when the editor is no longer visible? It is false by default
		 */
		readonly retainContextWhenHidden?: boolean;

		/**
		 * Does this model view editor support save?
		 */
		readonly supportsSave?: boolean;
	}

	export enum DataProviderType {
		ConnectionProvider = 'ConnectionProvider',
		BackupProvider = 'BackupProvider',
		RestoreProvider = 'RestoreProvider',
		ScriptingProvider = 'ScriptingProvider',
		ObjectExplorerProvider = 'ObjectExplorerProvider',
		TaskServicesProvider = 'TaskServicesProvider',
		FileBrowserProvider = 'FileBrowserProvider',
		ProfilerProvider = 'ProfilerProvider',
		MetadataProvider = 'MetadataProvider',
		QueryProvider = 'QueryProvider',
		AdminServicesProvider = 'AdminServicesProvider',
		AgentServicesProvider = 'AgentServicesProvider',
		CapabilitiesProvider = 'CapabilitiesProvider',
		DacFxServicesProvider = 'DacFxServicesProvider',
	}

	export namespace dataprotocol {
		/**
		 * Get the provider corresponding to the given provider ID and type
		 * @param providerId The ID that the provider was registered with
		 * @param providerType The type of the provider
		 */
		export function getProvider<T extends DataProvider>(providerId: string, providerType: DataProviderType): T;

		/**
		 * Get all registered providers of the given type
		 * @param providerType The type of the providers
		 */
		export function getProvidersByType<T extends DataProvider>(providerType: DataProviderType): T[];
	}

	/**
	 * Context object passed as an argument to command callbacks.
	 * Defines the key properties required to identify a node in the object
	 * explorer tree and take action against it.
	 */
	export interface ObjectExplorerContext {

		/**
		 * The connection information for the selected object.
		 * Note that the connection is not guaranteed to be in a connected
		 * state on click.
		 */
		connectionProfile: IConnectionProfile;
		/**
		 * Defines whether this is a Connection-level object.
		 * If not, the object is expected to be a child object underneath
		 * one of the connections.
		 */
		isConnectionNode: boolean;
		/**
		 * Node info for objects below a specific connection. This
		 * may be null for a Connection-level object
		 */
		nodeInfo: NodeInfo;
	}

	/**
	 * Background Operation
	 */
	export interface BackgroundOperation {
		/**
		 * Updates the operation status or adds progress message
		 * @param status Operation Status
		 * @param message Progress message
		 */
		updateStatus(status: TaskStatus, message?: string): void;

		/**
		 * Operation Id
		 */
		id: string;

		/**
		 * Event raised when operation is canceled in UI
		 */
		onCanceled: vscode.Event<void>;
	}

	/**
	 * Operation Information
	 */
	export interface BackgroundOperationInfo {

		/**
		 * The operation id. A unique id will be assigned to it If not specified a
		 */
		operationId?: string;
		/**
		 * Connection information
		 */
		connection?: connection.Connection;

		/**
		 * Operation Display Name
		 */
		displayName: string;

		/**
		 * Operation Description
		 */
		description: string;

		/**
		 * True if the operation is cancelable
		 */
		isCancelable: boolean;

		/**
		 * The actual operation to execute
		 */
		operation: (operation: BackgroundOperation) => void
	}

	namespace tasks {
		/**
		* Starts an operation to run in the background
		* @param operationInfo Operation Information
		*/
		export function startBackgroundOperation(operationInfo: BackgroundOperationInfo): void;

	}

	export namespace connection {
		/**
		 * List the databases that can be accessed from the given connection
		 * @param {string} connectionId The ID of the connection
		 * @returns {string[]} An list of names of databases
		 */
		export function listDatabases(connectionId: string): Thenable<string[]>;

		/**
		 * Get a URI corresponding to the given connection so that it can be used with data
		 * providers and other APIs that require a connection API.
		 * Note: If the given connection corresponds to multiple URIs this may return any of them
		 * @param connectionId The ID of the connection
		 */
		export function getUriForConnection(connectionId: string): Thenable<string>;

		/**
		 * Opens the connection dialog, calls the callback with the result. If connection was successful
		 * returns the connection otherwise returns undefined
		 * @param callback
		 */
		export function openConnectionDialog(providers?: string[], initialConnectionProfile?: IConnectionProfile, connectionCompletionOptions?: IConnectionCompletionOptions): Thenable<connection.Connection>;
	}

	export namespace nb {
		export function registerNotebookProvider(provider: NotebookProvider): vscode.Disposable;

		export interface NotebookProvider {
			readonly providerId: string;
			getNotebookManager(notebookUri: vscode.Uri): Thenable<NotebookManager>;
			handleNotebookClosed(notebookUri: vscode.Uri): void;
		}

		export interface NotebookManager {
			/**
			 * Manages reading and writing contents to/from files.
			 * Files may be local or remote, with this manager giving them a chance to convert and migrate
			 * from specific notebook file types to and from a standard type for this UI
			 */
			readonly contentManager: ContentManager;
			/**
			 * A SessionManager that handles starting, stopping and handling notifications around sessions.
			 * Each notebook has 1 session associated with it, and the session is responsible
			 * for kernel management
			 */
			readonly sessionManager: SessionManager;
			/**
			 * (Optional) ServerManager to handle server lifetime management operations.
			 * Depending on the implementation this may not be needed.
			 */
			readonly serverManager?: ServerManager;
		}

		/**
		 * Defines the contracts needed to manage the lifetime of a notebook server.
		 */
		export interface ServerManager {
			/**
			 * Indicates if the server is started at the current time
			 */
			readonly isStarted: boolean;

			/**
			 * Event sent when the server has started. This can be used to query
			 * the manager for server settings
			 */
			readonly onServerStarted: vscode.Event<void>;

			/**
			 * Starts the server. Some server types may not support or require this.
			 * Should no-op if server is already started
			 */
			startServer(): Thenable<void>;

			/**
			 * Stops the server. Some server types may not support or require this
			 */
			stopServer(): Thenable<void>;
		}

		//#region Content APIs
		/**
		 * Handles interacting with file and folder contents
		 */
		export interface ContentManager {
			/* Reads contents from a Uri representing a local or remote notebook and returns a
			 * JSON object containing the cells and metadata about the notebook
			 */
			getNotebookContents(notebookUri: vscode.Uri): Thenable<INotebook>;

			/**
			 * Save a file.
			 *
			 * @param notebookUri - The desired file path.
			 *
			 * @param notebook - notebook to be saved.
			 *
			 * @returns A thenable which resolves with the file content model when the
			 *   file is saved.
			 */
			save(notebookUri: vscode.Uri, notebook: INotebook): Thenable<INotebook>;
		}

		export interface INotebook {

			readonly cells: ICell[];
			readonly metadata: INotebookMetadata;
			readonly nbformat: number;
			readonly nbformat_minor: number;
		}

		export interface INotebookMetadata {
			kernelspec: IKernelInfo;
			language_info?: ILanguageInfo;
		}

		export interface IKernelInfo {
			name: string;
			language?: string;
			display_name?: string;
		}

		export interface ILanguageInfo {
			name: string;
			version: string;
			mimetype?: string;
			codemirror_mode?: string | ICodeMirrorMode;
		}

		export interface ICodeMirrorMode {
			name: string;
			version: string;
		}

		export interface ICell {
			cell_type: CellType;
			source: string | string[];
			metadata: {
				language?: string;
			};
			execution_count: number;
			outputs?: ICellOutput[];
		}

		export type CellType = 'code' | 'markdown' | 'raw';

		export interface ICellOutput {
			output_type: OutputType;
		}
		export interface IStreamResult extends ICellOutput {
			/**
			 * Stream output field defining the stream name, for example stdout
			 */
			name: string;
			/**
			 * Stream output field defining the multiline stream text
			 */
			text: string | Buffer;
		}
		export interface IDisplayResult extends ICellOutput {
			/**
			 * Mime bundle expected to contain mime type -> contents mappings.
			 * This is dynamic and is controlled by kernels, so cannot be more specific
			 */
			data: {};
			/**
			 * Optional metadata, also a mime bundle
			 */
			metadata?: {};
		}
		export interface IExecuteResult extends IDisplayResult {
			/**
			 * Number of times the cell was executed
			 */
			executionCount: number;
		}
		export interface IErrorResult extends ICellOutput {
			/**
			 * Exception name
			 */
			ename: string;
			/**
			 * Exception value
			 */
			evalue: string;
			/**
			 * Stacktrace equivalent
			 */
			traceback?: string[];
		}

		export type OutputType =
			| 'execute_result'
			| 'display_data'
			| 'stream'
			| 'error'
			| 'update_display_data';

		//#endregion

		//#region Session APIs
		export interface SessionManager {
			/**
			 * Indicates whether the manager is ready.
			 */
			readonly isReady: boolean;

			/**
			 * A Thenable that is fulfilled when the manager is ready.
			 */
			readonly ready: Thenable<void>;

			readonly specs: IAllKernels | undefined;

			startNew(options: ISessionOptions): Thenable<ISession>;

			shutdown(id: string): Thenable<void>;
		}

		export interface ISession {
			/**
			 * Is change of kernels supported for this session?
			 */
			canChangeKernels: boolean;
			/*
			 * Unique id of the session.
			 */
			readonly id: string;

			/**
			 * The current path associated with the session.
			 */
			readonly path: string;

			/**
			 * The current name associated with the session.
			 */
			readonly name: string;

			/**
			 * The type of the session.
			 */
			readonly type: string;

			/**
			 * The status indicates if the kernel is healthy, dead, starting, etc.
			 */
			readonly status: KernelStatus;

			/**
			 * The kernel.
			 *
			 * #### Notes
			 * This is a read-only property, and can be altered by [changeKernel].
			 */
			readonly kernel: IKernel;

			/**
			 * Tracks whether the default kernel failed to load
			 * This could be for a reason such as the kernel name not being recognized as a valid kernel;
			 */
			defaultKernelLoaded?: boolean;

			changeKernel(kernelInfo: IKernelSpec): Thenable<IKernel>;
		}

		export interface ISessionOptions {
			/**
			 * The path (not including name) to the session.
			 */
			path: string;
			/**
			 * The name of the session.
			 */
			name?: string;
			/**
			 * The type of the session.
			 */
			type?: string;
			/**
			 * The type of kernel (e.g. python3).
			 */
			kernelName?: string;
			/**
			 * The id of an existing kernel.
			 */
			kernelId?: string;
		}

		export interface IKernel {
			readonly id: string;
			readonly name: string;
			readonly supportsIntellisense: boolean;
			/**
			 * Test whether the kernel is ready.
			 */
			readonly isReady: boolean;

			/**
			 * A Thenable that is fulfilled when the kernel is ready.
			 */
			readonly ready: Thenable<void>;

			/**
			 * The cached kernel info.
			 *
			 * #### Notes
			 * This value will be null until the kernel is ready.
			 */
			readonly info: IInfoReply | null;

			/**
			 * Gets the full specification for this kernel, which can be serialized to
			 * a noteobok file
			 */
			getSpec(): Thenable<IKernelSpec>;

			/**
			 * Send an `execute_request` message.
			 *
			 * @param content - The content of the request.
			 *
			 * @param disposeOnDone - Whether to dispose of the future when done.
			 *
			 * @returns A kernel future.
			 *
			 * #### Notes
			 * See [Messaging in
			 * Jupyter](https://jupyter-client.readthedocs.io/en/latest/messaging.html#execute).
			 *
			 * This method returns a kernel future, rather than a Thenable, since execution may
			 * have many response messages (for example, many iopub display messages).
			 *
			 * Future `onReply` is called with the `execute_reply` content when the
			 * shell reply is received and validated.
			 *
			 * **See also:** [[IExecuteReply]]
			 */
			requestExecute(content: IExecuteRequest, disposeOnDone?: boolean): IFuture;


			/**
			 * Send a `complete_request` message.
			 *
			 * @param content - The content of the request.
			 *
			 * @returns A Thenable that resolves with the response message.
			 *
			 * #### Notes
			 * See [Messaging in Jupyter](https://jupyter-client.readthedocs.io/en/latest/messaging.html#completion).
			 *
			 * Fulfills with the `complete_reply` content when the shell reply is
			 * received and validated.
			 */
			requestComplete(content: ICompleteRequest): Thenable<ICompleteReplyMsg>;

			/**
			 * Interrupt a kernel.
			 *
			 * #### Notes
			 * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/kernels).
			 *
			 * The promise is fulfilled on a valid response and rejected otherwise.
			 *
			 * It is assumed that the API call does not mutate the kernel id or name.
			 *
			 * The promise will be rejected if the kernel status is `Dead` or if the
			 * request fails or the response is invalid.
			 */
			interrupt(): Thenable<void>;
		}

		export interface IInfoReply {
			protocol_version: string;
			implementation: string;
			implementation_version: string;
			language_info: ILanguageInfo;
			banner: string;
			help_links: {
				text: string;
				url: string;
			}[];
		}

		/**
		 * The contents of a requestExecute message sent to the server.
		 */
		export interface IExecuteRequest extends IExecuteOptions {
			code: string;
		}

		/**
		 * The options used to configure an execute request.
		 */
		export interface IExecuteOptions {
			/**
			 * Whether to execute the code as quietly as possible.
			 * The default is `false`.
			 */
			silent?: boolean;

			/**
			 * Whether to store history of the execution.
			 * The default `true` if silent is False.
			 * It is forced to  `false ` if silent is `true`.
			 */
			store_history?: boolean;

			/**
			 * A mapping of names to expressions to be evaluated in the
			 * kernel's interactive namespace.
			 */
			user_expressions?: {};

			/**
			 * Whether to allow stdin requests.
			 * The default is `true`.
			 */
			allow_stdin?: boolean;

			/**
			 * Whether to the abort execution queue on an error.
			 * The default is `false`.
			 */
			stop_on_error?: boolean;
		}

		/**
		 * The content of a `'complete_request'` message.
		 *
		 * See [Messaging in Jupyter](https://jupyter-client.readthedocs.io/en/latest/messaging.html#completion).
		 *
		 * **See also:** [[ICompleteReply]], [[IKernel.complete]]
		 */
		export interface ICompleteRequest {
			code: string;
			cursor_pos: number;
		}

		export interface ICompletionContent {
			matches: string[];
			cursor_start: number;
			cursor_end: number;
			metadata: any;
			status: 'ok' | 'error';
		}
		/**
		 * A `'complete_reply'` message on the `'stream'` channel.
		 *
		 * See [Messaging in Jupyter](https://jupyter-client.readthedocs.io/en/latest/messaging.html#completion).
		 *
		 * **See also:** [[ICompleteRequest]], [[IKernel.complete]]
		 */
		export interface ICompleteReplyMsg extends IShellMessage {
			content: ICompletionContent;
		}

		/**
		 * The valid Kernel status states.
		 */
		export type KernelStatus =
			| 'unknown'
			| 'starting'
			| 'reconnecting'
			| 'idle'
			| 'busy'
			| 'restarting'
			| 'dead'
			| 'connected';

		/**
		 * An arguments object for the kernel changed event.
		 */
		export interface IKernelChangedArgs {
			oldValue: IKernel | null;
			newValue: IKernel | null;
		}

		/// -------- JSON objects, and objects primarily intended not to have methods -----------
		export interface IAllKernels {
			defaultKernel: string;
			kernels: IKernelSpec[];
		}
		export interface IKernelSpec {
			name: string;
			language?: string;
			display_name?: string;
		}

		export interface MessageHandler<T extends IMessage> {
			handle(message: T): void | Thenable<void>;
		}


		/**
		 * A Future interface for responses from the kernel.
		 *
		 * When a message is sent to a kernel, a Future is created to handle any
		 * responses that may come from the kernel.
		 */
		export interface IFuture extends vscode.Disposable {

			/**
			 * The original outgoing message.
			 */
			readonly msg: IMessage;

			/**
			 * A Thenable that resolves when the future is done.
			 *
			 * #### Notes
			 * The future is done when there are no more responses expected from the
			 * kernel.
			 *
			 * The `done` Thenable resolves to the reply message if there is one,
			 * otherwise it resolves to `undefined`.
			 */
			readonly done: Thenable<IShellMessage | undefined>;

			/**
			 * Set the reply handler for the kernel future.
			 *
			 * #### Notes
			 * If the handler returns a Thenable, all kernel message processing pauses
			 * until the Thenable is resolved. If there is a reply message, the future
			 * `done` Thenable also resolves to the reply message after this handler has
			 * been called.
			 */
			setReplyHandler(handler: MessageHandler<IShellMessage>): void;

			/**
			 * Sets the stdin handler for the kernel future.
			 *
			 * #### Notes
			 * If the handler returns a Thenable, all kernel message processing pauses
			 * until the Thenable is resolved.
			 */
			setStdInHandler(handler: MessageHandler<IStdinMessage>): void;

			/**
			 * Sets the iopub handler for the kernel future.
			 *
			 * #### Notes
			 * If the handler returns a Thenable, all kernel message processing pauses
			 * until the Thenable is resolved.
			 */
			setIOPubHandler(handler: MessageHandler<IIOPubMessage>): void;

			/**
			 * Register hook for IOPub messages.
			 *
			 * @param hook - The callback invoked for an IOPub message.
			 *
			 * #### Notes
			 * The IOPub hook system allows you to preempt the handlers for IOPub
			 * messages handled by the future.
			 *
			 * The most recently registered hook is run first. A hook can return a
			 * boolean or a Thenable to a boolean, in which case all kernel message
			 * processing pauses until the Thenable is fulfilled. If a hook return value
			 * resolves to false, any later hooks will not run and the function will
			 * return a Thenable resolving to false. If a hook throws an error, the error
			 * is logged to the console and the next hook is run. If a hook is
			 * registered during the hook processing, it will not run until the next
			 * message. If a hook is removed during the hook processing, it will be
			 * deactivated immediately.
			 */
			registerMessageHook(
				hook: (msg: IIOPubMessage) => boolean | Thenable<boolean>
			): void;

			/**
			 * Remove a hook for IOPub messages.
			 *
			 * @param hook - The hook to remove.
			 *
			 * #### Notes
			 * If a hook is removed during the hook processing, it will be deactivated immediately.
			 */
			removeMessageHook(
				hook: (msg: IIOPubMessage) => boolean | Thenable<boolean>
			): void;

			/**
			 * Send an `input_reply` message.
			 */
			sendInputReply(content: IInputReply): void;
		}

		/**
		 * The valid channel names.
		 */
		export type Channel = 'shell' | 'iopub' | 'stdin';

		/**
		 * Kernel message header content.
		 *
		 * See [Messaging in Jupyter](https://jupyter-client.readthedocs.io/en/latest/messaging.html#general-message-format).
		 *
		 * **See also:** [[IMessage]]
		 */
		export interface IHeader {
			username: string;
			version: string;
			session: string;
			msg_id: string;
			msg_type: string;
		}

		/**
		 * A kernel message
		 */
		export interface IMessage {
			type: Channel;
			header: IHeader;
			parent_header: IHeader | {};
			metadata: {};
			content: any;
		}

		/**
		 * A kernel message on the `'shell'` channel.
		 */
		export interface IShellMessage extends IMessage {
			channel: 'shell';
		}

		/**
		 * A kernel message on the `'iopub'` channel.
		 */
		export interface IIOPubMessage extends IMessage {
			channel: 'iopub';
		}

		/**
		 * A kernel message on the `'stdin'` channel.
		 */
		export interface IStdinMessage extends IMessage {
			channel: 'stdin';
		}

		/**
		 * The content of an `'input_reply'` message.
		 */
		export interface IInputReply {
			value: string;
		}

		//#endregion

	}

}
