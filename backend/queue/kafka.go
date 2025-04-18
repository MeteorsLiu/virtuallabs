package queue

import (
	"context"
	"encoding/json"

	"github.com/zeromicro/go-queue/kq"
)

type OpCode int

const (
	OpCreateVM OpCode = iota + 1
	OpDeleteVM
)

var kafkaQueue = kq.NewPusher([]string{"localhost:9092"}, "k8s", kq.WithSyncPush())

type VMRequest struct {
	OpCode
	Vmid   int
	Vmname string
}

func CreateVM(vmid int, vmname string) error {
	b, _ := json.Marshal(&VMRequest{Vmid: vmid, Vmname: vmname, OpCode: OpCreateVM})
	return kafkaQueue.KPush(context.TODO(), "k8s", string(b))
}

func DeleteVM(vmid int, vmname string) error {
	b, _ := json.Marshal(&VMRequest{Vmid: vmid, Vmname: vmname, OpCode: OpDeleteVM})
	return kafkaQueue.KPush(context.TODO(), "k8s", string(b))

}
