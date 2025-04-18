package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"time"

	"github.com/MeteorsLiu/virtuallabs/backend/api/vm"
	appsv1 "k8s.io/api/apps/v1"
	apiv1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/util/yaml"
	"k8s.io/client-go/kubernetes"
	v1 "k8s.io/client-go/kubernetes/typed/apps/v1"
	"k8s.io/client-go/tools/clientcmd"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

var deploymentsClient v1.DeploymentInterface

func init() {
	config, err := clientcmd.BuildConfigFromFlags("", "k8sconfig.yml")
	if err != nil {
		panic(err)
	}
	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		panic(err)
	}

	deploymentsClient = clientset.AppsV1().Deployments(apiv1.NamespaceDefault)
}

func phaseToString(phase apiv1.PodPhase) string {
	switch phase {
	case apiv1.PodFailed:
		return "error"
	default:
		return "running"
	}
}

func callAPI(name, message string, phase apiv1.PodPhase) {
	req := &vm.VMStatusCallbackRequest{
		VMName:    name,
		Status:    phaseToString(phase),
		Message:   message,
		Timestamp: time.Now(),
	}
	b, _ := json.Marshal(req)

	http.Post("http://127.0.0.1:8888/virtualmachines/vm-status-callback", "application/json", bytes.NewBuffer(b))
}

func callbackStatus(pod *appsv1.Deployment) {
	watcher, err := deploymentsClient.Watch(context.TODO(),
		metav1.ListOptions{FieldSelector: "metadata.name=" + pod.Name})
	if err != nil {
		log.Println(err)
		return
	}
	defer watcher.Stop()

	for event := range watcher.ResultChan() {
		p, ok := event.Object.(*apiv1.Pod)
		if !ok {
			return
		}
		if p.Status.Phase != apiv1.PodPending {
			callAPI(pod.Name, p.Status.Message, p.Status.Phase)
			return
		}
	}
}

func createVm(Vmname string, port int) error {
	tmp, err := template.ParseFiles("k8sdeploy.yml.tmpl")
	if err != nil {
		return err
	}

	var buf bytes.Buffer

	if err := tmp.Execute(&buf, map[string]any{
		"Vmname": Vmname,
	}); err != nil {
		return err
	}
	var deployment appsv1.Deployment

	err = yaml.Unmarshal(buf.Bytes(), &deployment)
	if err != nil {
		return err
	}

	// Create Deployment
	fmt.Println("Creating deployment...")
	machine, err := deploymentsClient.Create(context.TODO(), &deployment, metav1.CreateOptions{})
	if err != nil {
		return err
	}
	go callbackStatus(machine)

	return nil
}

func deleteVm(Vmname string) error {
	deletePolicy := metav1.DeletePropagationForeground
	if err := deploymentsClient.Delete(context.TODO(), Vmname, metav1.DeleteOptions{
		PropagationPolicy: &deletePolicy,
	}); err != nil {
		return err
	}
	return nil
}
