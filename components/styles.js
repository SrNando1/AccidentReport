import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 10,
    backgroundColor: "#ff7b00",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  formGroup: {
    marginBottom: 15,
    backgroundColor: "#ff7b00",
  },
  formGroup1: {
    marginBottom: 15,
    backgroundColor: "#ff7b00",
    padding: 10,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  label: {
    fontSize: 20,
    marginBottom: 5,
    color: "#000000",
    fontWeight: "bold",
    fontStyle: "italic",
    paddingLeft: 5,
  },
  label1: {
    fontSize: 16,
    marginBottom: 5,
    color: "#000000",
    fontWeight: "bold",
    paddingLeft: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#2e86de",
    padding: 15,
    borderRadius: 6,
    marginTop: 20,
  },
  submitButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 10,
    backgroundColor: "white",
  },
  filledRectangle: {
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  checkIcon: {
    width: 40,
    height: 40,
    tintColor: "white", // se quiser aplicar cor branca ao ícone
  },
  unfilledRectangle: {
    backgroundColor: "#ffaa00", // laranja escuro
  },
  filledButton: {
    backgroundColor: "#A5D6A7", // verde claro para o botão inteiro
  },
  unfilledButton: {
    backgroundColor: "#fee2aa", // laranja claro
  },
});

export const screen = {
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#e0e0e0",
    borderWidth: 1,
    borderColor: "#000",
    height: 80,
    marginBottom: 15,
    overflow: "hidden",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: "100%",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "500",
    marginLeft: 15,
    flex: 1,
    textTransform: "capitalize", // Makes first letter uppercase
  },
  darkRectangle: {
    backgroundColor: "#808080",
    width: "20%",
    height: "100%",
    position: "absolute",
    right: 0,
  },
};

export const AccidentCharacterizationScreen = {
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  table: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  levelButton: {
    width: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingVertical: 20,
  },
  selectedButton: {
    backgroundColor: "#2e86de",
  },
  levelText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  descriptionContainer: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  titleText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  descriptionText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  tableCell: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  tableHeaderText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  tableValueText: {
    fontSize: 16,
    color: "#2e86de",
    textAlign: "center",
  },
};

export const ActionsDevelopedScreen = {
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  fileLabel: {
    fontWeight: "bold",
    color: "#black",
  },
  fileText: {
    color: "#FFFFFF",
    marginBottom: 5,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 8,
    width: "80%",
    maxWidth: 400,
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
};

export const ModalStyles = {
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 8,
    width: "80%",
    maxWidth: 400,
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
};
